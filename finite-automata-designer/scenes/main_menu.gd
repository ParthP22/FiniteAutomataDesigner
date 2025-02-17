extends Node2D



func _on_go_to_dfa_scene_button_down():
	SceneSwitcher.switch_scene("res://scenes/dfa_scene.tscn")


func _on_go_to_nfa_scene_button_down():
	SceneSwitcher.switch_scene("res://scenes/nfa_scene.tscn")
