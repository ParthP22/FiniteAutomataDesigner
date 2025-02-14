extends RichTextEffect
class_name RichSubscriptText

var bbcode := "sub"

func _process_custom_fx(char_fx):
	var offset:= Vector2(0, 5)
	char_fx.offset = offset
	return true
