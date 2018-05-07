import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import DirectoryString from "./DirectoryString.js";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class SignerLocation
{
	//**********************************************************************************
	/**
	 * Constructor for SignerLocation class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("countryName" in parameters)
			/**
			 * @type {DirectoryString}
			 * @description countryName
			 */
			this.countryName = getParametersValue(parameters, "countryName", SignerLocation.defaultValues("countryName"));
		
		if("localityName" in parameters)
			/**
			 * @type {DirectoryString}
			 * @description localityName
			 */
			this.localityName = getParametersValue(parameters, "localityName", SignerLocation.defaultValues("localityName"));
		
		if("postalAdddress" in parameters)
			/**
			 * @type {Array.<DirectoryString>}
			 * @description postalAdddress
			 */
			this.postalAdddress = getParametersValue(parameters, "postalAdddress", SignerLocation.defaultValues("postalAdddress"));
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
			case "countryName":
			case "localityName":
				return new DirectoryString();
			case "postalAdddress":
				return [];
			default:
				throw new Error(`Invalid member name for SignerLocation class: ${memberName}`);
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
			case "countryName":
			case "localityName":
				return ((DirectoryString.compareWithDefault("type", memberValue.type)) &&
						DirectoryString.compareWithDefault("value", memberValue.value));
			case "postalAdddress":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SignerLocation class: ${memberName}`);
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
		// PostalAddress ::= SEQUENCE SIZE(1..6) OF DirectoryString
		//
		// SignerLocation ::= SEQUENCE { -- at least one of the following shall be present:
		//    countryName [0] DirectoryString OPTIONAL,
		//    -- As used to name a Country in X.500
		//    localityName [1] DirectoryString OPTIONAL,
		//    -- As used to name a locality in X.500
		//    postalAdddress [2] PostalAddress OPTIONAL }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [countryName]
		 * @property {string} [localityName]
		 * @property {string} [postalAdddress]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.Choice({
							value: [
								new asn1js.TeletexString({ name: (names.countryName || "") }),
								new asn1js.PrintableString({ name: (names.countryName || "") }),
								new asn1js.UniversalString({ name: (names.countryName || "") }),
								new asn1js.Utf8String({ name: (names.countryName || "") }),
								new asn1js.BmpString({ name: (names.countryName || "") })
							]
						})
					]
				}),
				new asn1js.Constructed({
					name: (names.localityName || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new asn1js.Choice({
							value: [
								new asn1js.TeletexString({ name: (names.localityName || "") }),
								new asn1js.PrintableString({ name: (names.localityName || "") }),
								new asn1js.UniversalString({ name: (names.localityName || "") }),
								new asn1js.Utf8String({ name: (names.localityName || "") }),
								new asn1js.BmpString({ name: (names.localityName || "") })
							]
						})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [
						new asn1js.Repeated({
							name: (names.postalAdddress || ""),
							value: new asn1js.Choice({
								value: [
									new asn1js.TeletexString(),
									new asn1js.PrintableString(),
									new asn1js.UniversalString(),
									new asn1js.Utf8String(),
									new asn1js.BmpString()
								]
							})
						})
					]
				})
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
			SignerLocation.schema({
				names: {
					countryName: "countryName",
					localityName: "localityName",
					postalAdddress: "postalAdddress"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SignerLocation");
		//endregion
		
		//region Get internal properties from parsed schema
		if("countryName" in asn1.result)
			this.countryName = new DirectoryString({ schema: asn1.result.countryName });
		
		if("localityName" in asn1.result)
			this.localityName = new DirectoryString({ schema: asn1.result.localityName });
		
		if("postalAdddress" in asn1.result)
			this.postalAdddress = Array.from(asn1.result.postalAdddress, element => new DirectoryString({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("countryName" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					this.countryName.toSchema()
				]
			}));
		}
		
		if("localityName" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [
					this.localityName.toSchema()
				]
			}));
		}
		
		if("postalAdddress" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				value: Array.from(this.postalAdddress, element => element.toSchema())
			}));
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: outputArray
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
		const _object = {};
		
		if("countryName" in this)
			_object.countryName = this.countryName.toJSON();
		
		if("localityName" in this)
			_object.localityName = this.localityName.toJSON();
		
		if("postalAdddress" in this)
			_object.postalAdddress = Array.from(this.postalAdddress, element => element.toJSON());
		
		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
