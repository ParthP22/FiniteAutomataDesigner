extends Node2D

var node_rad = 26.1725006103516
var start_node: RigidBody2D = null
var end_node: RigidBody2D = null

var arrow_head = Polygon2D.new()
var arrow_shaft = Line2D.new()

var semi_circle_points = Curve2D.new()
var line_curve = Line2D.new()

func _ready():
	# Arrow to another node
	add_child(arrow_shaft)
	arrow_shaft.default_color = Color(1, 1, 1, 1)  # White color for visibility
	arrow_shaft.width = 3
	add_child(arrow_head)
	arrow_head.color = Color(1, 0, 0, 1)  # Red color for visibility
	
	# Arrow to self
	add_child(line_curve)
	line_curve.default_color = Color(1, 1, 1, 1) # White
	line_curve.width = 3
	

func _process(delta):
	if start_node and end_node and start_node == end_node:
		update_arrow_to_self()
	elif start_node and end_node and start_node != end_node:
		update_arrow_to_another()

func update_arrow_to_another():
	var start_pos = start_node.global_position
	var end_pos = end_node.global_position
	var distance = start_pos.distance_to(end_pos)
	# Offset start and end positions to prevent overlap with circles
	var t1 = node_rad / distance
	var t2 = node_rad / distance

	var x1 = (1 - t1) * start_pos.x + t1 * end_pos.x
	var y1 = (1 - t1) * start_pos.y + t1 * end_pos.y
	var x2 = (1 - t2) * end_pos.x + t2 * start_pos.x
	var y2 = (1 - t2) * end_pos.y + t2 * start_pos.y

	var adjusted_start = Vector2(x1, y1)
	var adjusted_end = Vector2(x2, y2)

	# Find a point 5 pixels away from the adjusted end point
	var t3 = 10 / adjusted_start.distance_to(adjusted_end)
	var x3 = (1 - t3) * x2 + t3 * x1
	var y3 = (1 - t3) * y2 + t3 * y1
	var arrow_tip = Vector2(x3, y3)

	# Find perpendicular direction for arrowhead
	var direction = (adjusted_end - adjusted_start).normalized()
	var perp_direction = Vector2(-direction.y, direction.x) * 7

	var perp_start = arrow_tip - perp_direction
	var perp_end = arrow_tip + perp_direction

	# Update shaft (main line)
	arrow_shaft.points = [adjusted_start, arrow_tip]

	# Update arrowhead
	arrow_head.polygon = PackedVector2Array([perp_start, adjusted_end, perp_end])
	
func update_arrow_to_self():
	var node_center = start_node.global_position
	# Clear the previous points
	semi_circle_points.clear_points()
	
	semi_circle_points.add_point(Vector2(node_center.x - node_rad+8, node_center.y - node_rad + 20))
	semi_circle_points.add_point(Vector2(node_center.x, node_center.y - (node_rad * 2)), 
				Vector2(-node_rad,0),
				Vector2(node_rad,0))
	semi_circle_points.add_point(Vector2(node_center.x + node_rad/2 + 5, node_center.y - node_rad))
	line_curve.points = semi_circle_points.get_baked_points()
	
	arrow_head.polygon = PackedVector2Array([
		Vector2(node_center.x + node_rad/2 - 10 + 5, node_center.y - node_rad),
		Vector2(node_center.x + node_rad/2 + 5, node_center.y - node_rad + 10),
		Vector2(node_center.x + node_rad/2 + 10 + 5, node_center.y - node_rad)
	])
	
	
