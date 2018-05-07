import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { PolicyInformation } from "pkijs";
import ESSCertIDv2 from "./ESSCertIDv2.js";
//**************************************************************************************
export default class SigningCertificateV2
{
	//**********************************************************************************
	/**
	 * Constructor for SigningCertificateV2 class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<ESSCertIDv2>}
		 * @description certs
		 */
		this.certs = getParametersValue(parameters, "certs", SigningCertificateV2.defaultValues("certs"));
		/**
		 * @type {Array.<PolicyInformation>}
		 * @description policies
		 */
		this.policies = getParametersValue(parameters, "policies", SigningCertificateV2.defaultValues("policies"));
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
			case "certs":
			case "policies":
				return [];
			default:
				throw new Error(`Invalid member name for SigningCertificateV2 class: ${memberName}`);
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
			case "certs":
			case "policies":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SigningCertificateV2 class: ${memberName}`);
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
		//SigningCertificateV2 ::=  SEQUENCE {
		//    certs        SEQUENCE OF ESSCertIDv2,
		//    policies     SEQUENCE OF PolicyInformation OPTIONAL
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [certs]
		 * @property {string} [policies]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Sequence({
					value: [
						new asn1js.Repeated({
							name: (names.certs || ""),
							value: ESSCertIDv2.schema()
						})
					]
				}),
				new asn1js.Sequence({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.policies || ""),
							value: PolicyInformation.schema()
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
			SigningCertificateV2.schema({
				names: {
					certs: "certs",
					policies: "policies"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SigningCertificateV2");
		//endregion
		
		//region Get internal properties from parsed schema
		//region certs
		// noinspection JSUnusedGlobalSymbols
		this.certs = Array.from(asn1.result.certs, element => new ESSCertIDv2({ schema: element }));
		//endregion
		
		//region policies
		if("policies" in asn1.result)
			this.policies = Array.from(asn1.result.policies, element => new PolicyInformation({ schema: element }));
		//endregion
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
		const outputArray = [
			new asn1js.Sequence({
				value: Array.from(this.certs, element => element.toSchema())
			})
		];
		
		//region policies
		if("policies" in this)
		{
			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.policies, element => element.toSchema())
			}));
		}
		//endregion
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
		const _object = {
			certs: Array.from(this.certs, element => element.toJSON())
		};
		
		//region policies
		if("policies" in this)
			_object.policies = Array.from(this.policies, element => element.toJSON());
		//endregion
		
		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************

