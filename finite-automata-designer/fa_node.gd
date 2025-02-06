extends PhysicsBody2D
var _is_start_state: bool = false
var _is_end_state: bool = false
var _label: Label = null
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
