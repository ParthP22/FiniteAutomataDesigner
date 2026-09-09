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

    // toSVG() hardcodes width="800" height="600" and emits no viewBox, so the
    // diagram would print at a fixed 800px and be clipped by the page margins.
    // Trade the fixed size for a viewBox so it scales to whatever paper is used.
    if (!source.hasAttribute("viewBox")) {
        const width = parseFloat(source.getAttribute("width") ?? "800") || 800;
        const height = parseFloat(source.getAttribute("height") ?? "600") || 600;
        source.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
    source.removeAttribute("width");
    source.removeAttribute("height");

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";

    // srcdoc carries only the page chrome; the diagram is grafted on as a real
    // DOM node once the frame loads, which keeps it in the SVG namespace.
    frame.srcdoc =
        '<!DOCTYPE html><meta charset="utf-8"><style>' +
        "@page { size: landscape; margin: 12mm; }" +
        "html, body { margin: 0; padding: 0; }" +
        "svg { display: block; width: 100%; height: auto; }" +
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
        doc.body.appendChild(doc.importNode(source, true));

        win.onafterprint = cleanup;
        window.setTimeout(cleanup, 60000);

        win.focus();
        win.print();
    }, { once: true });

    document.body.appendChild(frame);
}
