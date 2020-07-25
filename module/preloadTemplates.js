export const preloadTemplates = async function() {
	const templatePaths = [
		'systems/mage/partials/effect-selector.html' // A selector for adding effects in repeating groups
	];

	return loadTemplates( templatePaths );
}
