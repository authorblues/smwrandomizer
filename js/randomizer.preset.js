$('#preset').change(function()
{
	var preset = +$(this).val();
	if (preset > 0) $('.presetoption').prop('checked', false);
	
	if (preset == 0) return;
	
	$('#randomize_stages').prop('checked', true);
	$('#randomize_sameworld').prop('checked', preset < 2);
	$('#randomize_sametype').prop('checked', preset < 3);
	
	$('#levelnames_samestage').prop('checked', true);
	if (preset > 2) $('#levelnames_overworld').prop('checked', true);
	if (preset > 3) $('#levelnames_randomstage').prop('checked', true);
	$('#customnames').prop('checked', false);
	
	$('#bowser_default').prop('checked', true);
	if (preset > 1) $('#bowser_swapdoors').prop('checked', true);
	if (preset > 5) $('#bowser_minigauntlet').prop('checked', true);
	if (preset > 7) $('#bowser_gauntlet').prop('checked', true);
	$('#randomize_bowserdoors').prop('checked', preset > 3);
	
	$('#powerup_default').prop('checked', true);
	if (preset > 3) $('#powerup_randomize').prop('checked', true);
	
	$('#slippery').prop('checked', preset > 3);
	$('#addwater').prop('checked', preset > 5);
	$('#delwater').prop('checked', preset > 7);
	
	$('#randomize_exits').prop('checked', preset > 2);
	$('#randomize_koopakids').prop('checked', preset > 3);
	$('#remove_autoscrollers').prop('checked', preset > 4);
});

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
	return PRESET_NAMES[n] || "Custom";
}