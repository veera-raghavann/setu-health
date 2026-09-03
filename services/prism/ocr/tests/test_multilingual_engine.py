from src.ocr_engine import LANG_MAP
def test_supported_prism_languages_map_to_paddle_codes():
    assert LANG_MAP["en-IN"]=="en"
    assert LANG_MAP["ta-IN"]=="ta"
    assert LANG_MAP["hi-IN"]=="hi"