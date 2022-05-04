<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace Themeisle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;
use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Sharing_Icons_CSS
 */
class Sharing_Icons_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'sharing-icons';

	/**
	 * Generate Sharing Icons CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--iconsGap',
						'value'    => 'gap',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderRadius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => '--iconsBgColor',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--textColor',
						'value'    => 'textColor',
					),
				),
			)
		);

		return $css->generate();
	}
}
