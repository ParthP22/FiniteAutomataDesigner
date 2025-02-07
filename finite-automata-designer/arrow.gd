extends Node2D

var node_rad = 26.1725006103516
var start_node: RigidBody2D = null
var end_node: RigidBody2D = null

var arrow_head = Polygon2D.new()
var arrow_shaft = Polygon2D.new()

func _ready():
	add_child(arrow_head)  # Ensure Polygon2D is part of the scene
	arrow_head.color = Color(1, 0, 0, 1)  # Red color for visibility


func _process(delta):
	if start_node and end_node:
		update_arrow()

func update_arrow():
	var start_pos = start_node.global_position
	var end_pos = end_node.global_position
	
	var distance = end_pos.distance_to(start_pos)
	print(distance)
	
	var t1 = preload("res://filler.tscn").instantiate()
	var t2 = preload("res://filler.tscn").instantiate()
	t1.position = start_pos
	t2.position = end_pos
	add_child(t1)
	add_child(t2)
	
