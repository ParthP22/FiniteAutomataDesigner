extends PhysicsBody2D
var _is_start_state: bool: get = get_start_state, set = set_start_state
var _is_end_state: bool: get = get_end_state, set = set_end_state
var _notify_going_to: bool: get = get_notify, set = set_notify
var _self_looping = false
var _simple_name: String = ""
var _going_to: Dictionary = {}
var _incoming: Dictionary = {}
@onready var _label: RichTextLabel = null
@onready var _light: PointLight2D = $PointLight2D

var special_name: String = "state"

# Called when the node enters the scene tree for the first time.
func _ready():
	_is_start_state = false
	_is_end_state = false
	_label = $RichTextLabel

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass

func speak_up() -> String:
	return self.name

# Checks for underscores acting as subscript indicators
func set_text(new_label_text: String):
	_simple_name = new_label_text
	_label.bbcode_enabled = true
	var formatted_text = "[center][color=black]"
	var is_sub: bool = false
	for c in new_label_text:
		if c != "_":
			formatted_text += c
		else:
			if !is_sub:
				formatted_text += "[font_size=10][sub]"
				is_sub = !is_sub
			else:
				formatted_text += "[/sub][/font_size]"
				is_sub = !is_sub
	# closes out the formatting
	if is_sub:
		formatted_text += "[/sub][/font_size]"
	formatted_text += "[/color][/center]"
	_label.text = formatted_text

func get_text() -> String:
	return _label.text

func get_simple_name() -> String:
	return _simple_name

func toggle_light():
	if _light.energy > 1.1:
		_light.energy = 1
	else:
		_light.energy = 5
		
func turn_on_light():
	_light.energy = 5

func turn_off_light():
	_light.energy = 1

func draw_arrow_to_self(arrow_node: Object) -> Object:
	if !_self_looping:
		_self_looping = true
		_add_to_going_to(self, arrow_node) #tracking arrow node, self is key, arrow_node is value
		# drawing the arrow
		arrow_node.set_start_state(self)
		arrow_node.set_end_state(self)
		return arrow_node
	else:
		print(self.name, " already points to self, not redrawing")
		return null

# NOTE TO PARTH CAN YOU REWRITE THE IF STATEMENT(just flip conditions so that return null is in the else block and vice versa for the bottom)
func draw_arrow(other_node: Object, arrow_node: Object) -> Object:
	if _going_to.has(other_node) and _incoming.has(other_node):
		print(self.name, " and ", other_node.name, " point to each other (double arrow detection)")
		print("also not redrawing")
		
		return null
	elif _going_to.has(other_node):
		print(self.name, " points to", other_node.name, " already, not redrawing")
		return null
	else:
		# tracking arrow
		_add_to_going_to(other_node, arrow_node)
		other_node._add_to_incoming(self, arrow_node)
		# drawing the arrow
		arrow_node.set_start_state(self)
		arrow_node.set_end_state(other_node)
		# re-adjustment check
		if _going_to.has(other_node) and _incoming.has(other_node):
			_going_to[other_node].offset = 10
			_incoming[other_node].offset = 10
		return arrow_node

func erase_in_going_to(node: Object):
	if _going_to.has(node):
		#print("removing arrow tracking from ", _simple_name, " going to ", node.get_simple_name())
		_going_to.erase(node)
	
func erase_in_incoming(node: Object):
	if _incoming.has(node):
		#print("removing arrow tracking that came to ", _simple_name, " from ", node.get_simple_name())
		_incoming.erase(node)

func _add_to_going_to(node: Object, arrow: Object):
	#print('adding arrow to _going_to dict')
	_going_to[node] = arrow

func _add_to_incoming(node: Object, arrow: Object):
	#print('adding arrow to _incoming dict')
	_incoming[node] = arrow

func get_out_arrows():
	return _going_to

func get_in_arrows():
	return _incoming

func get_start_state():
	return _is_start_state

func get_end_state():
	return _is_end_state

func set_start_state(value: bool):
	_is_start_state = value
	update_light_color()

func set_end_state(value: bool):
	_is_end_state = value
	update_light_color()
	
func set_self_looping(value : bool):
	_self_looping = value

func update_light_color():
	if _is_start_state and _is_end_state:
		_light.color = Color("Purple")
		return
	if _is_start_state:
		_light.color = Color("Blue")
		return
	if _is_end_state:
		_light.color = Color("Green")
		return
	_light.color = Color(0.764, 0.81, 0.908)  # Default orange
		

func get_notify():
	return _notify_going_to

func get_current_letter() -> String:
	return get_parent().get_parent().curr_letter

# Notify all this states outgoing states if they have been reached and
# 			if they should be checking for the next input letter based on the arrow weights 
func set_notify(notify: bool):
	_notify_going_to = notify
	# Light up the state for some form of feed back that it has been visited
	if _light.energy <= 1:
		turn_on_light()
	# Get the parent object to get the current letter
	var main_parent = get_parent()
	var letter = main_parent.get_curr_letter()
	# update curr letter index
	main_parent.set_curr_letter()
	# you are told to check your states and the input string isn't empty, check all arrow weights and notify the states  based on the arrow weights
	if notify and letter != "":
		for state in _going_to:
			if letter in _going_to[state].get_transition():
				# wait two seconds before notifying the respective states
				await get_tree().create_timer(2).timeout
				state.set_notify(notify)
	elif letter == "":
		# Landing on an end state (acccepted)
		if _is_end_state:
			var result_string = "Reached end state, string: " + main_parent.get_input_string()
			main_parent._set_result_text(result_string)
		# Did not land on an accept state (rejected)
		else:
			var result_string = "Did not reach end state, string: " + main_parent.get_input_string()
			main_parent._set_result_text(result_string)
			
	
