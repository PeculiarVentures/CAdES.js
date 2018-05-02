import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class ContentHints
{
	//**********************************************************************************
	/**
	 * Constructor for ContentHints class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("contentDescription" in parameters)
			/**
			 * @type {string}
			 * @description contentDescription
			 */
			this.contentDescription = getParametersValue(parameters, "contentDescription", ContentHints.defaultValues("contentDescription"));
		
		/**
		 * @type {string}
		 * @description contentType
		 */
		this.contentType = getParametersValue(parameters, "contentType", ContentHints.defaultValues("contentType"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "contentDescription":
			case "contentType":
				return "";
			default:
				throw new Error(`Invalid member name for ContentHints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "contentDescription":
			case "contentType":
				return (memberValue === "");
			default:
				throw new Error(`Invalid member name for ContentHints class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		// ContentHints ::= SEQUENCE {
		//    contentDescription UTF8String (SIZE (1..MAX)) OPTIONAL,
		//    contentType ContentType }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [contentDescription]
		 * @property {string} [contentType]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Utf8String({
					name: (names.contentDescription || ""),
					optinal: true
				}),
				new asn1js.ObjectIdentifier({ name: (names.contentType || "") })
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			ContentHints.schema({
				names: {
					contentDescription: "contentDescription",
					contentType: "contentType"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ContentHints");
		//endregion
		
		//region Get internal properties from parsed schema
		if("contentDescription" in asn1.result)
			this.contentDescription = asn1.result.contentDescription.valueBlock.value;
		
		// noinspection JSUnusedGlobalSymbols
		this.contentType = asn1.result.contentType.valueBlock.toString();
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.Utf8String({ value: this.contentType }),
				new asn1js.ObjectIdentifier({ value: this.contentType })
			]
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			contentDescription: this.contentDescription,
			contentType: this.contentType
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
