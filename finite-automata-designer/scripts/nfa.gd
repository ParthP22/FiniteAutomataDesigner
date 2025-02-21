extends Node2D
var _preloaded_fa_node: PackedScene = preload("res://scenes/fa_node_2.tscn")
var _preloaded_arrow: PackedScene = preload("res://scenes/Arrow.tscn")
var _selected_node: RigidBody2D = null
var _selected_arrow: Node2D = null
var _all_nodes: Array = []
var _all_pointers: Dictionary = {}
var _is_dragging: bool = false
var _drag_offset: Vector2 = Vector2.ZERO
var _alphabet: Array = ["0","1"]
var _input_string: String = ""
var start_state : RigidBody2D = null
var end_state : RigidBody2D = null
var epsilon: String = "\u03B5"
var state_count = 0
var _input_to_letter: Array = []
var idx: int = 0

# Text Labels
@onready var _input_string_label: Label = $Control/InputStringRigidBody/InputStringLabel
@onready var _alphabet_label: Label = $Control/AlphabetRigidBody/AlphabetLabel
@onready var _result_label: Label = $Control/Result
# Text fields (LineEdits)
@onready var _input_string_text_field: LineEdit = $InputTextField/LineEdit
@onready var _alphabet_text_field: LineEdit = $AlphabetTextField/LineEdit
@onready var _state_text_field: LineEdit = $StateTextField/LineEdit
@onready var _arrow_text_field: LineEdit = $ArrowTextField/LineEdit
# Toggle Buttons
@onready var _is_start_state_toggle: RigidBody2D = $StartStateToggle
@onready var _is_end_state_toggle: RigidBody2D = $EndStateToggle
# Regular Buttons
@onready var _run_btn: Button = $Control/RunButton


# Called when the node enters the scene tree for the first time.
func _ready():
	# Simple labeling of the alphabet label on start up
	var result = "{"
	for letter in _alphabet:
		result += letter + ","
	result = result.substr(0, result.length()-1)
	result += "}"
	_alphabet_label.text = "Alphabet: " + result 
	pass 

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if _is_dragging:
		drag_state()
			

# Called anytime an 'event' occurs i.e. mouse move, clicks
func _input(event):
	# Setting state and arrow fields to be visible
	if _selected_node and !_selected_arrow and is_instance_valid(_selected_node):
		_state_text_field.visible = true
		_arrow_text_field.visible = false
		
		#set the state of the check buttons before showing them
		_is_start_state_toggle.get_child(0).button_pressed  = _selected_node.get_start_state()
		_is_end_state_toggle.get_child(0).button_pressed  = _selected_node.get_end_state()
		_is_start_state_toggle.visible = true
		_is_end_state_toggle.visible = true
	else:
		_state_text_field.visible = false
		_is_start_state_toggle.visible = false
		_is_end_state_toggle.visible = false
	
	if _selected_arrow and !_selected_node:
		_arrow_text_field.visible = true
	else:
		_arrow_text_field.visible = false
	# Based on selection using `left click` draw accordingly
	if event.is_action_pressed("left_click"):
		select()
		return
	# # Drawing arrows using `left click`
	if event.is_action_pressed("shift_keyboard"):
		connect_nodes()
		return
	if event.is_action_pressed("right_click"):
		if _selected_node and is_instance_valid(_selected_node):
			_drag_offset = get_global_mouse_position() - _selected_node.global_position
			
			_is_dragging = true
		else:
			_is_dragging = false
	if event.is_action_released("right_click"):
		_is_dragging = false
	if event.is_action_pressed("delete_keyboard"):
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

func drag_state():
	if _selected_node and _is_dragging:
		var new_position = get_global_mouse_position() - _drag_offset
		_selected_node.position = new_position

# turn the pointlight2d brightness up and down
func toggle_state_brightness():
	if _selected_node:
		_selected_node.toggle_light()

# turn the pointlight2d brightness up and down for curr selected arrow
func toggle_arrow_brightness():
	if _selected_arrow:
		_selected_arrow.toggle_light()

func select():
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
	elif node is StaticBody2D and _selected_arrow:
		print("selected new arrow")
		deselect_curr_node()
		deselect_arrow()
		select_arrow(node)
	else:
		print(epsilon)
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
	if _selected_node and is_instance_valid(_selected_node):
		_selected_node.toggle_light()
		_selected_node = null

func deselect_arrow():
	if _selected_arrow and is_instance_valid(_selected_arrow):
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
	if !_selected_node and !_selected_arrow:
		print("nothing is selected, deleting nothing")
	if _selected_node and is_instance_valid(_selected_node):
		print("deleting state: ", _selected_node.get_simple_name())
		delete_state()
		return
	if _selected_arrow:
		delete_arrow()

# Deletes states and associated arrows
func delete_state():
	if _selected_node:
		_state_delete_arrow()

# Does the actual deleting of states and arrows
func _state_delete_arrow():
	var out_going_arrow_dict = _selected_node.get_out_arrows()
	var out_going_count = out_going_arrow_dict.size()
	var incoming_arrows_dict = _selected_node.get_in_arrows()
	var incoming_count = incoming_arrows_dict.size()
	for x in range(out_going_count):
		for key in out_going_arrow_dict:
			_delete_arrow(out_going_arrow_dict[key])
	for x in range(incoming_count):
		for key in incoming_arrows_dict:
			_delete_arrow(incoming_arrows_dict[key])
	# After deleting all associated arrows to the node, then remove the state from the queue and array
	var _selected_state_idx = _all_nodes.find(_selected_node)
	if _selected_state_idx > -1:
		_all_nodes.remove_at(_selected_state_idx)
		_selected_node.queue_free()
		_selected_arrow = null
	
# Deletes arrows
func delete_arrow():
	if _selected_arrow:
		_delete_arrow(_selected_arrow)
		
# Actully does the deleting of arrows
func _delete_arrow(arrow):
	var deleting_this_arrow = arrow
	var begin_state = deleting_this_arrow.get_start_state()
	var finish_state = deleting_this_arrow.get_end_state()
	if begin_state == finish_state:
		begin_state.set_self_looping(false)
	begin_state.erase_in_going_to(finish_state)
	finish_state.erase_in_incoming(begin_state)
	deleting_this_arrow.queue_free()
	deleting_this_arrow = null

func _on_state_edit_text_submitted(new_text):
	if _selected_node:
		_selected_node.set_text(new_text)
		_state_text_field.text = ""

# NOTE TO PARTH (myself): string formatting needs to be implementing
# to check for duplicate transitions, etc
func _on_arrow_edit_text_submitted(new_text : String):
	if _selected_arrow:
		
		# We will convert the new transition into an Array.
		# Simultaneously, we will check the new transition
		# contains any illegal characters, which if it does,
		# then we return.
		var i : int = 0
		var new_transition : Array = []
		
		while i < len(new_text):
			# Checks to see if an epsilon transition was added
			if new_text[i] == "e" and i + 1 < len(new_text) and new_text[i+1] == "p":
				if epsilon not in new_transition:
					new_transition.append(epsilon)
				i += 2
				continue
			if new_text[i] != "," and new_text[i] not in new_transition:
				if new_text[i] not in _alphabet:
					print(new_text[i] + " is not in the alphabet")
					return
				else:
					new_transition.append(new_text[i])
			i += 1
		
		var formatted_text = ""
		for elem in new_transition:
			formatted_text += elem
			formatted_text += ","
		formatted_text = formatted_text.left(len(formatted_text)-1)
		
		_selected_arrow.set_text(formatted_text)
		_selected_arrow.set_transition(new_transition)
		_arrow_text_field.text = ""

# Called everytime the start state toggle is clicked (trigger)
func _on_start_state_button_toggled(toggled_on):
	if _selected_node and is_instance_valid(_selected_node):
		# Get number of start states
		var start_state_count = 0
		for state in _all_nodes:
			if state.get_start_state():
				start_state_count += 1
		# If there is already a start state, reset it and make the current selected node the start state
		if start_state_count == 1:
			if start_state != _selected_node and toggled_on:
				start_state.set_start_state(false)
				start_state = _selected_node
				start_state.set_start_state(toggled_on)
		else:
			start_state = _selected_node
			start_state.set_start_state(toggled_on)
			
#func _on_start_state_button_toggled_off(toggled_off):
	#if _selected_node:
		#if start_state:
			#_selected_node.set_start_state(toggled_off)
			#start_state = null
		#else:
			#print("There is no start state!")

func _on_end_state_button_toggled(toggled_on):
	if _selected_node and is_instance_valid(_selected_node):
		# Get number of end states
		var end_state_count = 0
		for state in _all_nodes:
			if state.get_end_state():
				end_state_count += 1
		# If there is already an end state, reset it and make the current selected node the end state
		if end_state_count == 0:
			if toggled_on:
				end_state = _selected_node
				end_state.set_end_state(toggled_on)
			else:
				end_state = null
		else:
			end_state = _selected_node
			end_state.set_end_state(toggled_on)

func _on_input_text_submitted(new_text):
	_input_string = new_text
	_input_string_label.text = ""
	_input_string_label.text = "String: " + _input_string
	_input_string_text_field.text = ""
	_nfa(new_text)

func _on_alphabet_text_submitted(new_text):
	# Reset alphabet array to prepare it for the new alphabet
	_alphabet = []
	
	# Add each element of the new alphabet into the alphabet array
	for c in new_text:
		if c != ',':
			_alphabet.append(c)

	# Print it out for good measure
	print(_alphabet)
	
	# Set the label to the new alphabet
	_alphabet_label.text = ""
	_alphabet_label.text = "Alphabet: {" + new_text + "}"
	
	# Reset text field after submission
	_alphabet_text_field.text = ""

# Used by fa_node_2's as they call the parent class to get the current letter of the input string being run
func get_curr_letter():
	if idx < _input_to_letter.size():
		return _input_to_letter[idx]
	else:
		return ""
# Used by fa_node_2's as they go through the input string
func set_curr_letter():
	if idx < _input_to_letter.size():
		idx += 1
# Reset the index into the input string to zero
func reset_idx():
	idx = 0
	
# Animates a blind (NFA) check of the input string and current machine
func _on_button_button_down():
	# Deselect the _selected_node
	deselect_curr_node()
	# Reset the input string index so that you can start from the beginning
	reset_idx()
	# Turn off any misc states being light up for some reason
	for state in _all_nodes:
		state.turn_off_light()
	# If a start state is labeled and is valid, run the input string
	if start_state and is_instance_valid(start_state):
		_result_label.text = "Running"
		# (new variable) an array of the input string from the user
		_input_to_letter = _input_string.split()
		# notify the start state that it can beging running through the string
		start_state.set_notify(true)
	else:
		# If no start state is defined, define one
		_result_label.text = "Please select a start state!"

func _set_result_text(text: String) -> void:
	_result_label.text = text

func get_input_string() -> String:
	return _input_string

	
func _nfa(input : String) -> bool:
	if start_state == null and end_state == null:
		print("Start and end states are both undefined")
		_result_label.text = "Start and end states are both undefined"
		return false
	elif start_state == null:
		print("Start state undefined")
		_result_label.text = "Start state undefined"
		return false
	elif end_state == null:
		print("End state undefined")
		_result_label.text = "End state undefined"
		return false
	
	# First, we make sure the input string is legal. If it contains
	# characters not defined in the alphabet, then we return false immediately.
	for char in input:
		if char not in _alphabet:
			_result_label.text = "Input contains \'" + char + "\', which is not in the alphabet"
			print("Input contains \'" + char + "\', which is not in the alphabet")
			return false
	
	# This "curr" variable will be used to traverse over the whole DFA.
	var curr : RigidBody2D = start_state
	

	
	# We begin traversing the input string.
	for char in input:
		# We go through every outgoing arrow for the 
		# current state.
		for arrow in curr.get_out_arrows().values():
			# If the current character from the input string
			# is found in one of the transitions, then we 
			# use that transition to move to the next state.
			if char in arrow.get_transition():
				curr = arrow.get_end_state()
				break
	# If the final state that we arrived at is the end state,
	# that means the string was accepted.
	if curr == end_state:
		_result_label.text = "Accepted!"
		print("Accepted!")
		return true
	# Else, the final state we arrived at is not the end state,
	# which means the string was rejected.
	else:
		_result_label.text = "Rejected!"
		print("Rejected!")
		return false
	

func _go_home():
	SceneSwitcher.switch_scene("res://scenes/main_menu.tscn")
