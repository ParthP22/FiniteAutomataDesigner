extends PhysicsBody2D
var is_start_state: bool = false
var is_end_state: bool = false
var _self_looping = false
var _label: Label = null
var _going_to: Dictionary = {}
var _incoming: Dictionary = {}

@onready var _light: PointLight2D = $PointLight2D
# Called when the node enters the scene tree for the first time.
func _ready():
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
		return null
	elif _going_to.has(other_node):
		print(self.name, " points to", other_node.name, " already, not redrawing")
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
		return arrow_node

	
func _add_to_going_to(node: Object, arrow: Object):
	_going_to[node] = arrow


func _add_to_incoming(node: Object, arrow: Object):
	_incoming[node] = arrow

	
func _check_double_arrow(incoming_node: Object, going_to_node: Object) -> bool:
	return true
	
