extends Node2D
var _preloaded_fa_node = preload("res://fa_node_2.tscn")
var _selected_node: RigidBody2D = null
var _text_field: LineEdit = null
var _all_nodes: Array = []

# Called when the node enters the scene tree for the first time.
func _ready():
	_text_field = get_child(1).get_child(1)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
			
func _input(event):
	if event.is_action_pressed("left_click"):
		draw_node()
	elif event.is_action_pressed("shift_right_click"):
		connect_nodes()
		
func return_ray_point_result():
	var mouse_pos = get_global_mouse_position()
	var space_state = get_world_2d().direct_space_state
	var query = PhysicsPointQueryParameters2D.new()
	query.position = mouse_pos
	query.collide_with_bodies = true # Ensure it detects PhysicsBody2D nodes
	var results = space_state.intersect_point(query)
	if results.size() == 1:
		print(results[0].collider)
		return results[0].collider
	return null

func toggle_brightness():
	if _selected_node != null:
		if _selected_node.get_child(0).energy > 1 :
			_selected_node.get_child(0).energy = 0.5
		else:
			_selected_node.get_child(0).energy = 2

func draw_node():
	var node = return_ray_point_result()
	# If you click the anything else with a collision don't draw the circle 
	if node is RigidBody2D and node.get_child(1) is LineEdit:
		print("clicked on an object that isn't state")
		return
	# If you click a state select it
	elif node is RigidBody2D and node.get_child(0) is PointLight2D:
		toggle_brightness()
		_selected_node = node
		toggle_brightness()
		print("selection changed: ", _selected_node.name)
		return
	# If you already have a node selected, deselect it
	if _selected_node != null:
		print("deselected: ", _selected_node.name)
		toggle_brightness()
		_selected_node = null
		return
	# If no existing node was found and nothing was selected, create a new FA_Node
	else:
		var temp = _preloaded_fa_node.instantiate()
		temp.position = get_global_mouse_position()
		_selected_node = temp
		toggle_brightness()
		add_child(temp)
		_all_nodes.append(_selected_node)
		
# Draw a line between two states
func connect_nodes():
	# Check if anything is selected
	if !_selected_node:
		print("No node selected!")
	else:
		#Check collision with another node
		var node = return_ray_point_result()
		# collision check with self
		if node == _selected_node: 
			if !node.self_looping:
				node.self_looping = true
				node.add_to_outgoing(node)
				var self_arrow = preload("res://Arrow.tscn").instantiate()
				self_arrow.start_node = _selected_node
				self_arrow.end_node = _selected_node
				add_child(self_arrow)
				print("making self loop")
				return
			else:
				print("node already points to self")
		# collision with another node
		elif node != _selected_node and node != null:
			# points from _selected_node -> other_node
			_selected_node.add_to_outgoing(node)
			node.add_to_incoming(_selected_node)
			var arrow = preload("res://Arrow.tscn").instantiate()
			arrow.start_node = _selected_node
			arrow.end_node = node
			add_child(arrow)
			return
			

func _on_line_edit_text_submitted(new_text):
	if _selected_node:
		_selected_node.set_text(new_text)
		_text_field.text = ""
