// Breathing room (in SVG user units, i.e. canvas pixels) left around the
// diagram once it's cropped to its contents.
const CROP_PADDING = 20;

// A cropped viewBox is never made smaller than this, so a two-state diagram
// isn't blown up to fill the whole sheet (strokes and labels scale with it).
const MIN_VIEW_WIDTH = 400;
const MIN_VIEW_HEIGHT = 300;

/**
 * Prints an SVG document produced by ExportAsSVG.
 *
 * The markup is parsed as XML rather than handed to an HTML parser. ExportAsSVG
 * emits a standalone SVG file (XML prolog + DOCTYPE), which the HTML parser
 * rejects; stripping those by hand is easy to get subtly wrong, and when it goes
 * wrong the shapes are silently reparsed in the HTML namespace, where only the
 * <text> nodes render. Parsing as image/svg+xml sidesteps that entirely.
 */
export function printSVG(svg: string, documentTitle: string) {
    // The exporter interpolates raw state/transition labels into XML comments,
    // so a label containing "--" produces a malformed comment. Comments carry no
    // visual information, so drop them all before parsing.
    const withoutComments = svg.replace(/<!--[\s\S]*?-->/g, "");

    const parsed = new DOMParser().parseFromString(withoutComments, "image/svg+xml");
    if (parsed.getElementsByTagName("parsererror").length > 0) {
        console.error("printSVG: could not parse the exported SVG");
        return;
    }

    const source = parsed.documentElement;

    // toSVG() hardcodes width="800" height="600" and emits no viewBox. Keep the
    // full canvas as the fallback viewBox (used for an empty canvas), and drop
    // the fixed size so the stylesheet below decides how big it prints.
    const canvasWidth = parseFloat(source.getAttribute("width") ?? "800") || 800;
    const canvasHeight = parseFloat(source.getAttribute("height") ?? "600") || 600;
    if (!source.hasAttribute("viewBox")) {
        source.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
    }
    source.removeAttribute("width");
    source.removeAttribute("height");

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";

    // srcdoc carries only the page chrome; the diagram is grafted on as a real
    // DOM node once the frame loads, which keeps it in the SVG namespace.
    //
    // The SVG is fixed to the page area and sized on BOTH axes, letting the
    // viewBox's default "xMidYMid meet" scale it to fit and center it. Sizing by
    // width alone (height:auto) lets the height overshoot the page: on A4
    // landscape the diagram is cut off or split, and on Letter it lands within a
    // rounding error of the page height and spills an empty second page. A fixed
    // element also takes nothing from the normal flow, so the document can never
    // paginate past one page.
    frame.srcdoc =
        '<!DOCTYPE html><meta charset="utf-8"><style>' +
        "html, body { margin: 0; padding: 0; }" +
        "svg { display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; }" +
        "</style>";

    // Tearing the iframe down too early cancels the job in some browsers, and
    // onafterprint doesn't fire everywhere — hence the belt-and-braces timeout.
    let removed = false;
    const cleanup = () => {
        if (removed) return;
        removed = true;
        frame.remove();
    };

    frame.addEventListener("load", () => {
        const doc = frame.contentDocument;
        const win = frame.contentWindow;
        if (!doc || !win) {
            cleanup();
            return;
        }

        // Assigned rather than interpolated so an automaton name can't inject markup.
        doc.title = documentTitle;
        // DOMParser types documentElement as HTMLElement whatever the MIME type,
        // but parsing as image/svg+xml guarantees an <svg> root.
        const printed = doc.importNode(source, true) as unknown as SVGSVGElement;
        doc.body.appendChild(printed);

        // getBBox needs the node in a rendered document, hence measuring here.
        const crop = cropToContents(printed);

        // Orient the sheet to match the diagram, so a tall automaton isn't
        // shrunk to fit the short side of a landscape page.
        const pageStyle = doc.createElement("style");
        pageStyle.textContent =
            `@page { size: ${crop.width >= crop.height ? "landscape" : "portrait"}; margin: 12mm; }`;
        doc.head.appendChild(pageStyle);

        win.onafterprint = cleanup;
        window.setTimeout(cleanup, 60000);

        win.focus();
        win.print();
    }, { once: true });

    document.body.appendChild(frame);
}

/**
 * Narrows the viewBox to the drawn shapes (plus padding), so the diagram is
 * centered on the page rather than wherever it happened to sit on the canvas,
 * and anything dragged past the canvas edge still prints. Leaves the viewBox
 * alone for an empty canvas. Returns the viewBox size it settled on.
 */
function cropToContents(svg: SVGSVGElement): { width: number; height: number } {
    const current = svg.viewBox.baseVal;

    let box: DOMRect;
    try {
        box = svg.getBBox();
    } catch {
        return { width: current.width, height: current.height };
    }
    if (box.width === 0 && box.height === 0) {
        return { width: current.width, height: current.height };
    }

    const width = Math.max(box.width + CROP_PADDING * 2, MIN_VIEW_WIDTH);
    const height = Math.max(box.height + CROP_PADDING * 2, MIN_VIEW_HEIGHT);
    const x = box.x + box.width / 2 - width / 2;
    const y = box.y + box.height / 2 - height / 2;

    svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
    return { width, height };
}
