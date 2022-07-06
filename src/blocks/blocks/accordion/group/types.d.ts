import { BlockProps, InspectorProps } from '../../../helpers/blocks'

type Attributes = {
	id: string
	gap: string
	titleColor: string
	titleBackground: string
	contentBackground: string
	isSynced: string
	fontFamily: string
	fontVariant: string
	fontStyle: string
	textTransform: string
	fontSize: number
	letterSpacing: number
	headerBorder: object
	contentBorder: object
	headerPadding: object
	contentPadding: object
	tag: string
	alwaysOpen: boolean
}

export type AccordionGroupProps = BlockProps<Attributes>
export interface AccordionGroupInspectorProps extends InspectorProps<Attributes> {}
