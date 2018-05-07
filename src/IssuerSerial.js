import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { GeneralNames } from "pkijs";
//**************************************************************************************
export default class IssuerSerial
{
	//**********************************************************************************
	/**
	 * Constructor for IssuerSerial class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {GeneralNames}
		 * @description issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", IssuerSerial.defaultValues("issuer"));
		/**
		 * @type {Integer}
		 * @description serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerSerial.defaultValues("serialNumber"));
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
			case "issuer":
				return new GeneralNames();
			case "serialNumber":
				return new asn1js.Integer();
			default:
				throw new Error(`Invalid member name for IssuerSerial class: ${memberName}`);
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
			case "issuer":
				return (memberValue.names.length === 0);
			case "serialNumber":
				return (memberValue.isEqual(IssuerSerial.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for IssuerSerial class: ${memberName}`);
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
		//IssuerSerial ::= SEQUENCE {
		//    issuer                   GeneralNames,
		//    serialNumber             CertificateSerialNumber
		//}
		//
		//CertificateSerialNumber ::= INTEGER

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				GeneralNames.schema(names.issuer || {}),
				new asn1js.Integer({ name: (names.serialNumber || "") })
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
			IssuerSerial.schema({
				names: {
					issuer: {
						names: {
							blockName: "issuer"
						}
					},
					serialNumber: "serialNumber"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuerSerial");
		//endregion

		//region Get internal properties from parsed schema
		// noinspection JSUnusedGlobalSymbols
		this.issuer = new GeneralNames({ schema: asn1.result.issuer });
		// noinspection JSUnusedGlobalSymbols
		this.serialNumber = asn1.result.serialNumber;
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
				this.issuer.toSchema(),
				this.serialNumber
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
			issuer: this.issuer.toJSON(),
			serialNumber: this.serialNumber.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
