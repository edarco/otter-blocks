import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	isString,
	isObject
} from 'lodash';

/**
 * @typedef {Object} IClearButton
 * @property {React.ReactNode} children
 * @property {(string | Object.<string, ?boolean>)[]} values
 * @property {Function} setAttributes
 */

/**
 * A button for clearing the values of array of attributes
 * @param {...IClearButton} props
 * @returns {React.FunctionComponent}
 */
const ClearButton = ({
	children,
	values,
	setAttributes
}) => {

	const clearValues = () => {
		const attrToClear = values
			.map(
				value => {
					if ( isString( value ) ) {
						return value;
					} else if ( isObject( value )   ) {
						const keys =  Object.keys( value );
						if ( 1 === keys.length ) {
							return value[ keys[0] ] ? keys[0] : undefined;
						}
					}
					return undefined;
				}
			)
			.fiter( isString )
			.reduce( ( acc, attrName ) => {
				acc[attrName] = undefined;
				return acc;
			});
		setAttributes( attrToClear );
	};

	return (
		<div>
			<Button
				isSmall
				isSecondary
				onClick={ clearValues }
			>
				{children || __( 'Clear', 'otter-blocks' )}
			</Button>
		</div>
	);
};

export default ClearButton;
