extends Area2D
var _fa_scene = preload("res://fa_node.tscn") # Load once for efficiency

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		spawn_fa_node(get_global_mouse_position())

func spawn_fa_node(mousePos: Vector2):
	print("Node clicked! Spawning FA!")
	# instantiate the fa_node scene
	var fa_instance = _fa_scene.instantiate()
	
	# set position to mouse
	fa_instance.position = mousePos
	#actually spawn the node
	get_parent().add_child(fa_instance)
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
