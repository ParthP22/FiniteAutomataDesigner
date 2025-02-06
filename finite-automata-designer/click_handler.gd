extends Area2D


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_on_click()

func _on_click():
	print("Node clicked!")
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
