extends Node2D
var _preloaded_fa_node: PackedScene = preload("res://fa_node_2.tscn")
var _preloaded_arrow: PackedScene = preload("res://Arrow.tscn")
var _selected_node: RigidBody2D = null
var _selected_arrow: Node2D = null
var _all_nodes: Array = []
var _is_dragging: bool = false
var _drag_offset: Vector2 = Vector2.ZERO
var _alphabet: Array = ["0","1"]
var _input_string: String = ""
var start_state : RigidBody2D = null
var end_state : RigidBody2D = null
var state_count = 0

# Text Labels
@onready var _input_string_label: Label = $Control/InputStringRigidBody/InputStringLabel
@onready var _alphabet_label: Label = $Control/AlphabetRigidBody/AlphabetLabel
# Text fields (LineEdits)
@onready var _input_string_text_field: LineEdit = $InputTextField/LineEdit
@onready var _alphabet_text_field: LineEdit = $AlphabetTextField/LineEdit
@onready var _state_text_field: LineEdit = $StateTextField/LineEdit
@onready var _arrow_text_field: LineEdit = $ArrowTextField/LineEdit
# Toggles
@onready var _is_start_state: RigidBody2D = $StartStateToggle
@onready var _is_end_state: RigidBody2D = $EndStateToggle



# Called when the node enters the scene tree for the first time.
func _ready():
	pass 

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if _is_dragging:
		drag_self()
			

# Called anytime an 'event' occurs i.e. mouse move, clicks
func _input(event):
	# Setting state and arrow fields to be visible
	if _selected_node and !_selected_arrow:
		_state_text_field.visible = true
		_arrow_text_field.visible = false
		
		#set the state of the check buttons before showing them
		_is_start_state.get_child(0).button_pressed  = _selected_node.get_start_state()
		_is_end_state.get_child(0).button_pressed  = _selected_node.get_end_state()
		_is_start_state.visible = true
		_is_end_state.visible = true
	else:
		_state_text_field.visible = false
		_is_start_state.visible = false
		_is_end_state.visible = false
	
	if _selected_arrow and !_selected_node:
		_arrow_text_field.visible = true
	else:
		_arrow_text_field.visible = false
	# Drawing states using `left click` and selecting states and arrows using `left click`
	if event.is_action_pressed("left_click"):
		draw()
		return
	# # Drawing arrows using `left click`
	if event.is_action_pressed("shift_keyboard"):
		connect_nodes()
		return
	if event.is_action_pressed("right_click"):
		if _selected_node:
			_drag_offset = get_global_mouse_position() - _selected_node.global_position
			_is_dragging = true
		else:
			_is_dragging = false
	if event.is_action_released("right_click"):
		_is_dragging = false
	if event.is_action_pressed("backspace_keyboard"):
		delete_selected()

func loop_through_nodes():
	pass
	
func return_ray_point_result():
	var mouse_pos = get_global_mouse_position()
	var space_state = get_world_2d().direct_space_state
	var query = PhysicsPointQueryParameters2D.new()
	query.position = mouse_pos
	query.collide_with_bodies = true # Ensure it detects PhysicsBody2D nodes
	var results = space_state.intersect_point(query)
	if results.size() == 1:
		return results[0].collider
	return null

func drag_self():
	if _selected_node and _is_dragging:
		var new_position = get_global_mouse_position() - _drag_offset
		_selected_node.position = new_position

# turn the pointlide2d brightness up and down
func toggle_brightness():
	if _selected_node:
		_selected_node.toggle_light()
		
func toggle_arrow_brightness():
	if _selected_arrow:
		_selected_arrow.toggle_light()

func draw():
	var node = return_ray_point_result()
	var mouse_pos = get_global_mouse_position()
	# Rewriting click checks
	# If nothing hit by raycast and no node selected
	if !node and !_selected_node:
		# If nothing is hit, draw the circle there
		deselect_arrow()
		deselect_curr_node()
		var state = draw_state(mouse_pos)
		select_node(state)
		return
	if !node and _selected_node:
		# if nothing is hit and a node is selected, just reset and wait for the next click
		deselect_arrow()
		deselect_curr_node()
		return
	if node is RigidBody2D and _all_nodes.find(node) > -1:
		# you hit a state, deselect the curr state and select the new one
		select_node(node)
		deselect_arrow()
		return
	elif node is StaticBody2D and !_selected_arrow:
		# if you click an arrow, deselect curr state and any curr arrow
		print("selected arrow")
		deselect_curr_node()
		select_arrow(node)
		return
	else:
		print('clicked something else')

func select_node(node: RigidBody2D):
	if _selected_node:
		deselect_curr_node()
		_selected_node = node
		_selected_node.toggle_light()
	else:
		_selected_node = node
		_selected_node.toggle_light()
		
func select_arrow(arrow: StaticBody2D):
	if _selected_arrow:
		deselect_arrow()
		_selected_arrow = arrow
		_selected_arrow.toggle_light()
	else:
		_selected_arrow = arrow
		_selected_arrow.toggle_light()
		
func deselect_curr_node():
	if _selected_node:
		_selected_node.toggle_light()
		_selected_node = null

func deselect_arrow():
	if _selected_arrow:
		_selected_arrow.toggle_light()
		_selected_arrow = null

func draw_state(mouse_pos: Vector2) -> RigidBody2D:
	var state: RigidBody2D = _preloaded_fa_node.instantiate()
	state.position = mouse_pos
	add_child(state)
	_all_nodes.append(state)
	state.set_text("q_" + str(state_count)+"_")
	state_count += 1
	return state

# Draw a line between two states
func connect_nodes():
	# Check if anything is selected
	if !_selected_node:
		print("No node selected!")
	else:
		var node = return_ray_point_result()
		# Check collision with selected node
		if node == _selected_node: 
			var arrow_node = _selected_node.draw_arrow_to_self(_preloaded_arrow.instantiate())
			if arrow_node:
				add_child(arrow_node)
			return
		# collision with raycast hit
		elif node != _selected_node and node != null:
			# Verifying the node you selected is an FA_Node
			if node.get_child(0) is Sprite2D:
				var arrow_node = _selected_node.draw_arrow(node, _preloaded_arrow.instantiate())
				if arrow_node:
					add_child(arrow_node)
				return
			else:
				print("shift press on something other than a node")
				
# If something (state/arrow) is selected, delete it and associated objects
func delete_selected():
	if _selected_arrow:
		_selected_arrow.start_node.remove_arrow(_selected_arrow.end_node)
		_selected_arrow.end_node.remove_arrow(_selected_arrow.start_node)
		_selected_arrow.queue_free()
		_selected_arrow = null
	if _selected_node:
		var complete = delete_attached_arrows(_selected_node)
		
		return
			
# Deleted 
func delete_attached_arrows(node: Object):
	var selected_node_going_to = node._going_to
	var selected_node_incoming = node._incoming
	print("going to size",selected_node_going_to.size())
	var going_to_count = selected_node_going_to.size()
	print("incoming size",selected_node_incoming.size())
	var incoming_count = selected_node_incoming.size()
	for x in range(going_to_count):
		for key in selected_node_going_to:
			var arrow = selected_node_going_to[key]
			arrow.start_node.erase_in_going_to(arrow.end_node)
			arrow.end_node.remove_arrow(arrow.start_node)
			arrow.queue_free()
	for x in range(incoming_count):
		print("incoming count",x)
		for key in selected_node_incoming:
			var arrow = selected_node_incoming[key]
			print(arrow)
			arrow.start_node.remove_arrow(arrow.end_node)
			arrow.end_node.remove_arrow(arrow.start_node)
			arrow.queue_free()
	return "complete"


func _on_state_edit_text_submitted(new_text):
	if _selected_node:
		_selected_node.set_text(new_text)
		_state_text_field.text = ""

func _on_arrow_edit_text_submitted(new_text : String):
	if _selected_arrow:
		for char in new_text:
			if char != "," and char not in _alphabet:
				print(char + " is not in the alphabet")
				return
		
		if(_transition_determinism_check(_selected_arrow,new_text)):
			
			_selected_arrow.set_text(new_text)
			_selected_arrow.set_transition(new_text)
		else:
			print("failed")
		_arrow_text_field.text = ""

func _on_start_state_button_toggled(toggled_on):
	if _selected_node:
		if start_state:
			print("There already exists a start state!")
		else:
			_selected_node.set_start_state(toggled_on)
			start_state = _selected_node

func _on_end_state_button_toggled(toggled_on):
	if _selected_node:
		if end_state:
			print("There already exists an end state!")
		else:
			_selected_node.set_end_state(toggled_on)
			end_state = _selected_node

func _on_input_text_submitted(new_text):
	_input_string = new_text
	_input_string_label.text = ""
	_input_string_label.text = "String: " + _input_string
	_input_string_text_field.text = ""

func _on_alphabet_text_submitted(new_text):
	# Add each element of the new alphabet into the alphabet array
	for char in new_text:
		if char != ',':
			_alphabet.append(char)

	# Print it out for good measure
	print(_alphabet)
	
	# Set the label to the new alphabet
	_alphabet_label.text = ""
	_alphabet_label.text = "Alphabet: " + new_text
	
	# Reset text field after submission
	_alphabet_text_field.text = ""
	
func _on_button_button_down():
	print('pressed run button')
	pass # Replace with function body.
	
func _transition_determinism_check(arrow: Node2D, new_transitions: String) -> bool:
	for value in arrow.start_node.get_out_arrows().values():
		var transitions = value.get_transition()
		for transition in transitions:
			for new_transition in new_transitions:
				if new_transition != "," and new_transition in transition:
					return false
	return true
	
func _dfa():
	var tmp : RigidBody2D = start_state
	pass
