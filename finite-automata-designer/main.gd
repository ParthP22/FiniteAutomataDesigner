extends Node2D
var _preloaded_fa_node = preload("res://fa_node_2.tscn")
var _selected_node: Node2D = null
var _text_field: LineEdit = null

# Called when the node enters the scene tree for the first time.
func _ready():
	_text_field = get_child(1)
#
## Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
	#pass

func _input(event):
	if event.is_action_pressed("left_click"):
		if _selected_node == null:
			var node = _preloaded_fa_node.instantiate()
			node.position = get_global_mouse_position()
			add_child(node)
	elif event.is_action("right_click"):
		if _selected_node != null:
			print("deselected")
			_selected_node.get_child(1).text = "a"
