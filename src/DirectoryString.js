import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
export default class DirectoryString
{
	//**********************************************************************************
	/**
	 * Constructor for DirectoryString class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @description 0 - TELETEXSTRING, 1 - PRINTABLESTRING, 2 - UNIVERSALSTRING, 3 - UTF8STRING, 4 - BMPSTRING
		 */
		this.type = getParametersValue(parameters, "type", DirectoryString.defaultValues("type"));
		/**
		 * @type {Array}
		 * @description value
		 */
		this.value = getParametersValue(parameters, "value", DirectoryString.defaultValues("value"));
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
			case "type":
				return (-1);
			case "value":
				return "";
			default:
				throw new Error(`Invalid member name for DirectoryString class: ${memberName}`);
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
			case "type":
				return (memberValue === DirectoryString.defaultValues(memberName));
			case "values":
				return (memberValue === "");
			default:
				throw new Error(`Invalid member name for DirectoryString class: ${memberName}`);
		}
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
			new asn1js.Choice({
				value: [
					new asn1js.TeletexString({ name: "directoryString" }),
					new asn1js.PrintableString({ name: "directoryString" }),
					new asn1js.UniversalString({ name: "directoryString" }),
					new asn1js.Utf8String({ name: "directoryString" }),
					new asn1js.BmpString({ name: "directoryString" })
				]
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for DirectoryString");
		//endregion
		
		//region Get internal properties from parsed schema
		// noinspection JSUnresolvedVariable
		this.value = asn1.result.directoryString.valueBlock.value;
		
		// noinspection JSUnresolvedVariable
		switch(asn1.result.directoryString.idBlock.tagNumber)
		{
			case 20: // TELETEXSTRING
				this.type = 0;
				break;
			case 19: // PRINTABLESTRING
				this.type = 1;
				break;
			case 28: // UNIVERSALSTRING
				this.type = 2;
				break;
			case 12: // UTF8STRING
				this.type = 3;
				break;
			case 30: // BMPSTRING
				this.type = 4;
				break;
			default:
				throw new Error("Object's schema was not verified against input data for DirectoryString");
		}
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
		let result;
		
		switch(this.type)
		{
			case 0: // TELETEXSTRING
				result = new asn1js.TeletexString({ value: this.value });
				break;
			case 1: // PRINTABLESTRING
				result = new asn1js.PrintableString({ value: this.value });
				break;
			case 2: // UNIVERSALSTRING
				result = new asn1js.UniversalString({ value: this.value });
				break;
			case 3: // UTF8STRING
				result = new asn1js.Utf8String({ value: this.value });
				break;
			case 4: // BMPSTRING
				result = new asn1js.BmpString({ value: this.value });
				break;
			default:
				throw new Error("Incorrectly initialized data for \"DirectoryString\" class");
		}
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return result;
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
			value: this.value,
			type: this.type
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
