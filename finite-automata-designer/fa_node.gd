extends AnimatableBody2D


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		print("clicked me an FA node!!!! :D")
		var parent = get_parent()
		if parent.name == "Main":
			parent._curr_select_node = self
			parent.print_curr_selection()
		
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
