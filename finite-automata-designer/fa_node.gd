extends PhysicsBody2D
var is_start_state: bool = false
var is_end_state: bool = false
var self_looping = false
var _label: Label = null
var _out_going_to: Array = []
var _incoming: Array = []
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

func add_to_outgoing(node: Object):
	_out_going_to.append(node)
	
func add_to_incoming(node: Object):
	_incoming.append(node)
	
func _print_array_size():
	print(_out_going_to.size())
