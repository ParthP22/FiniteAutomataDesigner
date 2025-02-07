extends Node2D
var _preloaded_fa_node = preload("res://fa_node_2.tscn")
var _selected_node: RigidBody2D = null
var _text_field: LineEdit = null
var _all_nodes: Array = []

# Called when the node enters the scene tree for the first time.
func _ready():
	_text_field = get_child(1).get_child(1)
	var arrow_node = Polygon2D.new()
	arrow_node.polygon = PackedVector2Array([
		Vector2(100,  100),
		Vector2(100, 200),
		Vector2(200, 150)
	])
	add_child(arrow_node)
#
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

func toggle_brightness():
	if _selected_node != null:
		if _selected_node.get_child(0).energy > 1 :
			_selected_node.get_child(0).energy = 0.5
		else:
			_selected_node.get_child(0).energy = 2

func _input(event):
	if event.is_action_pressed("left_click"):
		draw_node()
	elif event.is_action_pressed("shift_right_click"):
		connect_nodes()

func draw_node():
	# point cast for node checks
	var mouse_pos = get_global_mouse_position()
	var space_state = get_world_2d().direct_space_state
	var query = PhysicsPointQueryParameters2D.new()
	query.position = mouse_pos
	query.collide_with_bodies = true # Ensure it detects PhysicsBody2D nodes
	# results of point cast
	var results = space_state.intersect_point(query)
	for i in range(results.size()):
		var node = results[i].collider
		if node is PhysicsBody2D and node.get_child(1) is LineEdit:
			print("clicked on lineEdit")
			return
		elif node is PhysicsBody2D and node.get_child(0) is PointLight2D:
			toggle_brightness()
			_selected_node = node
			toggle_brightness()
			print("selection changed: ", _selected_node.name)
			return
	# ELSE PART
	if _selected_node != null:
		print("deselected: ", _selected_node.name)
		toggle_brightness()
		_selected_node = null
		return
	else:
		# If no existing node was found and nothing was selected, create a new FA_Node
		var node = _preloaded_fa_node.instantiate()
		node.position = get_global_mouse_position()
		_selected_node = node
		toggle_brightness()
		add_child(node)
		_all_nodes.append(_selected_node)
		
func connect_nodes():
	if !_selected_node:
		print("No node selected!")
	else:
		#Check collision with another node
		# point cast for node checks
		var mouse_pos = get_global_mouse_position()
		var space_state = get_world_2d().direct_space_state
		var query = PhysicsPointQueryParameters2D.new()
		query.position = mouse_pos
		query.collide_with_bodies = true # Ensure it detects PhysicsBody2D nodes
		# results of point cast
		var results = space_state.intersect_point(query)
		for result in results:
			var node = result.collider
			# collision check with self
			if node == _selected_node: 
				if !node.self_looping:
					node.self_looping = true
					node.add_to_outgoing(node)
					print("making self loop")
					return
				else:
					print("node already points to self")
			# collision with another node
			elif node != _selected_node:
				# points from _selected_node -> other_node
				_selected_node.add_to_outgoing(node)
				node.add_to_incoming(_selected_node)
				var arrow = preload("res://Arrow.tscn").instantiate()
				arrow.start_node = _selected_node
				arrow.end_node = node
				add_child(arrow)

				print("connected *funny little dance*")
				return
		print("hit nothing")

func _on_line_edit_text_submitted(new_text):
	if _selected_node:
		_selected_node.set_text(new_text)
		_text_field.text = ""
