extends Area2D

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		spawn_fa_node(get_global_mouse_position())

func spawn_fa_node(mousePos: Vector2):
	print("Node clicked! Spawning FA!")
	
	var fa_scene = load("res://fa_node.tscn")
	var fa_instance = fa_scene.instantiate()
	fa_instance.position = mousePos
	get_parent().add_child(fa_instance)
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
