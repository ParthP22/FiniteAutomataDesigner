extends PhysicsBody2D
var is_start_state: bool = false
var is_end_state: bool = false
var self_looping = false
var _label: Label = null
var _out_going_to: Dictionary = {}
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

func add_to_outgoing(node: Object, arrow: Object):
	if !_out_going_to.has(node):
		_out_going_to[node] = arrow
	
func add_to_incoming(node: Object, arrow: Object):
	if !_incoming:
		_incoming[node] = arrow
	
func toggle_light():
	if _light.energy > 1.1:
		_light.energy = 1
	else:
		_light.energy = 2
	
func _contains_node_out_going(node: Object) -> bool:
	for n in _out_going_to:
		if node == n:
			print("Arrow connecting from this node to the next already exists")
			return true
	return false

func _contains_node_incoming(node: Object):
	for n in _incoming:
		if n == node:
			print("The node already points to this one!!")
			return true
	return false
	
func contains(node: Object):
	for n in _out_going_to:
		if n == node:
			return true
	for n in _incoming:
		if n == node:
			return true
	return false
	
func _print_array_size():
	print(_out_going_to.size())
