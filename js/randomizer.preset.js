function updatePreset(val)
{
	var preset = val instanceof Number ? val : +$('#preset').val();
	if (preset > 0) $('.presetoption').prop('checked', false);
	
	if (preset == 0) return;
	
	$('#randomize_stages').prop('checked', true);
	$('#randomize_exits').prop('checked', preset > 2);
	$('#randomize_warps').prop('checked', preset > 3);
	$('#randomize_sameworld').prop('checked', preset < 2);
	$('#randomize_sametype').prop('checked', preset < 2);
	
	$('#randomize_levelexits').prop('checked', preset > 5);
	$('#randomize_noyoshi').prop('checked', preset > 2);
	$('#randomize_colors').prop('checked', preset > 4);
	
	$('#levelnames_samestage').prop('checked', true);
	if (preset > 2) $('#levelnames_overworld').prop('checked', true);
	if (preset > 3) $('#levelnames_randomstage').prop('checked', true);
	
	$('#bowser_default').prop('checked', true);
	if (preset > 1) $('#bowser_swapdoors').prop('checked', true);
	if (preset > 4) $('#bowser_minigauntlet').prop('checked', true);
	if (preset > 7) $('#bowser_gauntlet').prop('checked', true);
	$('#randomize_bowserdoors').prop('checked', preset > 3);
	
	$('#powerup_default').prop('checked', true);
	if (preset > 3) $('#powerup_randomize').prop('checked', true);
	
	$('#slippery').prop('checked', preset > 3);
	$('#addwater').prop('checked', preset > 5);
	$('#delwater').prop('checked', preset > 7);
	
	$('#saving_all').prop('checked', true);
	if (preset > 3) $('#saving_original').prop('checked', true);
	if (preset > 6) $('#saving_default').prop('checked', true);
	
	$('#enemyprop_default').prop('checked', true);
	if (preset > 2) $('#enemyprop_normal').prop('checked', true);
	if (preset > 7) $('#enemyprop_chaos').prop('checked', true);
	
	$('#randomize_koopakids').prop('checked', preset > 3);
	$('#randomize_bossdiff').prop('checked', preset > 5);
	$('#remove_autoscrollers').prop('checked', preset > 4);
	
	$('#customnames').prop('checked', preset > 2);
	$('#customtext').prop('checked', preset > 3);
	$('#pogyo_mode').prop('checked', preset > 5);
}

$('#preset').change(updatePreset);

// selecting any option by hand should set the preset box to "custom"
$('.presetoption').click(function()
{
	$('#preset').val(0);
});

var PRESET_NAMES =
[
	"Custom",
	"Gnarly",
	"Tubular",
	"Way Cool",
	"Awesome",
	"Groovy",
	"Mondo",
	"Outrageous",
	"Funky",
];

function getPresetName(n)
{
	if (n === undefined) n = $('#preset').val();
	return PRESET_NAMES[n] || PRESET_NAMES[0];
}