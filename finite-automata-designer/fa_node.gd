extends PhysicsBody2D
var _is_start_state: bool: get = get_start_state, set = set_start_state
var _is_end_state: bool: get = get_end_state, set = set_end_state
var _self_looping = false
var _label: Label = null
var _going_to: Dictionary = {}
var _incoming: Dictionary = {}
@onready var _light: PointLight2D = $PointLight2D

var special_name: String = "state"

# Called when the node enters the scene tree for the first time.
func _ready():
	_is_start_state = false
	_is_end_state = false
	_label = get_child(2)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

func speak_up() -> String:
	return self.name

func set_text(new_label_text: String):
	_label.text = ""
	_label.text = new_label_text
	
func toggle_light():
	if _light.energy > 1.1:
		_light.energy = 1
	else:
		_light.energy = 2

func draw_arrow_to_self(arrow_node: Object) -> Object:
	if !_self_looping:
		_self_looping = true
		_add_to_going_to(self, arrow_node) #tracking arrow node, self is key, arrow_node is value
		# drawing the arrow
		arrow_node.set_start_node(self)
		arrow_node.set_end_node(self)
		return arrow_node
	else:
		print(self.name, " already points to self, not redrawing")
		return null

# NOTE TO PARTH CAN YOU REWRITE THE IF STATEMENT(just flip conditions so that return null is in the else block and vice versa for the bottom)
func draw_arrow(other_node: Object, arrow_node: Object) -> Object:
	if _going_to.has(other_node) and _incoming.has(other_node):
		print(self.name, " and ", other_node.name, " point to each other (double arrow detection)")
		print("also not redrawing")
		print(typeof(_going_to[other_node]))
		
		print(_going_to)
		print(_incoming)
		
		return null
	elif _going_to.has(other_node):
		print(self.name, " points to", other_node.name, " already, not redrawing")
		
		
		print(_going_to)
		print(_incoming)
		
		return null
	else:
		# tracking arrow
		_add_to_going_to(other_node, arrow_node)
		other_node._add_to_incoming(self, arrow_node)
		# drawing the arrow
		arrow_node.set_start_node(self)
		arrow_node.set_end_node(other_node)
		# re-adjustment check
		if _going_to.has(other_node) and _incoming.has(other_node):
			_going_to[other_node].offset = 10
			_incoming[other_node].offset = 10
			
		
		print(_going_to)
		print(_incoming)
		
		return arrow_node
	

func _add_to_going_to(node: Object, arrow: Object):
	_going_to[node] = arrow

func _add_to_incoming(node: Object, arrow: Object):
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
		
