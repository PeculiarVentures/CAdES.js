import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
export default class NoticeReference
{
	//**********************************************************************************
	/**
	 * Constructor for NoticeReference class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description organization
		 */
		this.organization = getParametersValue(parameters, "organization", NoticeReference.defaultValues("organization"));
		/**
		 * @type {number}
		 * @description Type number for "organization"
		 */
		this._organizationType = -1;
		/**
		 * @type {Array}
		 * @description noticeNumbers
		 */
		this.noticeNumbers = getParametersValue(parameters, "noticeNumbers", NoticeReference.defaultValues("noticeNumbers"));
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
			case "organization":
				return "";
			case "noticeNumbers":
				return [];
			default:
				throw new Error(`Invalid member name for NoticeReference class: ${memberName}`);
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
			case "organization":
				return (memberValue === "");
			case "noticeNumbers":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for NoticeReference class: ${memberName}`);
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
		// NoticeReference ::= SEQUENCE {
		//    organization DisplayText,
		//    noticeNumbers SEQUENCE OF INTEGER }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [optional]
		 * @property {string} [organization]
		 * @property {string} [noticeNumbers]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new asn1js.Choice({
					value: [
						new asn1js.VisibleString({ name: (names.organization || "") }),
						new asn1js.BmpString({ name: (names.organization || "") }),
						new asn1js.Utf8String({ name: (names.organization || "") })
					]
				}),
				new asn1js.Sequence({
					value: [
						new asn1js.Repeated({
							name: (names.noticeNumbers || ""),
							value: new asn1js.Integer()
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
			NoticeReference.schema({
				names: {
					organization: "organization",
					noticeNumbers: "noticeNumbers"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for NoticeReference");
		//endregion
		
		//region Get internal properties from parsed schema
		this.organization = asn1.result.organization.valueBlock.value;
		
		switch(asn1.result.organization.idBlock.tagNumber)
		{
			case 26: // VISIBLESTRING
				// noinspection JSUnusedGlobalSymbols
				this._organizationType = 0;
				break;
			case 30: // BMPSTRING
				// noinspection JSUnusedGlobalSymbols
				this._organizationType = 1;
				break;
			case 12: // UTF8STRING
				// noinspection JSUnusedGlobalSymbols
				this._organizationType = 2;
				break;
			default:
				throw new Error("Object's schema was not verified against input data for NoticeReference");
		}

		this.noticeNumbers = Array.from(asn1.result.noticeNumbers);
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
		
		switch(this._organizationType)
		{
			case 0:
				outputArray.push(new asn1js.VisibleString({ value: this.organization }));
				break;
			case 1:
				outputArray.push(new asn1js.BmpString({ value: this.organization }));
				break;
			case 2:
				outputArray.push(new asn1js.Utf8String({ value: this.organization }));
				break;
			default:
				throw new Error("Non-initialized \"organization\" value");
		}
		
		outputArray.push(new asn1js.Sequence({
			value: Array.from(this.noticeNumbers)
		}));
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
		return {
			organization: this.organization,
			noticeNumbers: Array.from(this.noticeNumbers.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
