import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { RelativeDistinguishedNames, BasicOCSPResponse } from "pkijs";
//**************************************************************************************
export default class OcspIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for OcspIdentifier class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {RelativeDistinguishedNames|OctetString|Any}
		 * @description ocspResponderID
		 */
		this.ocspResponderID = getParametersValue(parameters, "ocspResponderID", OcspIdentifier.defaultValues("ocspResponderID"));
		/**
		 * @type {Date}
		 * @description producedAt
		 */
		this.producedAt = getParametersValue(parameters, "producedAt", OcspIdentifier.defaultValues("producedAt"));
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
			case "ocspResponderID":
				return new asn1js.Any();
			case "producedAt":
				return new Date(0, 0, 0);
			default:
				throw new Error(`Invalid member name for OcspIdentifier class: ${memberName}`);
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
			case "ocspResponderID":
				return (memberValue instanceof asn1js.Any);
			case "producedAt":
				return (memberValue === OcspIdentifier.defaultValues(memberName));
			default:
				throw new Error(`Invalid member name for OcspIdentifier class: ${memberName}`);
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
		// OcspIdentifier ::= SEQUENCE {
		//    ocspResponderID ResponderID, -- As in OCSP response data
		//    producedAt GeneralizedTime -- As in OCSP response data  }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [ocspResponderID]
		 * @property {string} [producedAt]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new asn1js.Choice({
					value: [
						new asn1js.Constructed({
							name: (names.ocspResponderID || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [RelativeDistinguishedNames.schema()]
						}),
						new asn1js.Constructed({
							name: (names.ocspResponderID || ""),
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 2 // [2]
							},
							value: [new asn1js.OctetString()]
						})
					]
				}),
				new asn1js.GeneralizedTime({ name: (names.producedAt || "") })
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
			OcspIdentifier.schema({
				names: {
					ocspResponderID: "ocspResponderID",
					producedAt: "producedAt"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OcspIdentifier");
		//endregion
		
		//region Get internal properties from parsed schema
		if(asn1.result.ocspResponderID.idBlock.tagNumber === 1)
			this.ocspResponderID = new RelativeDistinguishedNames({ schema: asn1.result.ocspResponderID.valueBlock.value[0] });
		else
			this.ocspResponderID = asn1.result.ocspResponderID.valueBlock.value[0]; // OCTETSTRING
		
		this.producedAt = asn1.result.producedAt.toDate();
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(this.ocspResponderID instanceof asn1js.Any)
			throw new Error("Incorrectly initialized \"OcspIdentifier\" class");
		
		//region Create array for output sequence
		const outputArray = [];
		
		if(this.ocspResponderID instanceof RelativeDistinguishedNames)
			outputArray.push(this.ocspResponderID.toSchema());
		else
			outputArray.push(this.ocspResponderID);
		
		outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.producedAt }));
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
		if(this.ocspResponderID instanceof asn1js.Any)
			throw new Error("Incorrectly initialized \"OcspIdentifier\" class");
		
		return {
			ocspResponderID: this.ocspResponderID.toJSON(),
			producedAt: this.producedAt
		};
	}
	//**********************************************************************************
	/**
	 * Fill internal values of current class
	 * @param {Object} parameters
	 */
	fillValues(parameters)
	{
		//region Initial variables
		let ocspResponse;
		//endregion
		
		//region Check input parameters
		if("ocspResponse" in parameters)
			ocspResponse = parameters.ocspResponse; // in_window.org.pkijs.simpl.OCSP_RESPONSE
		else
			throw new Error("Parameter \"ocspResponse\" is mandatory for making \"OcspResponsesID\"");
		//endregion
		
		//region Fill internal fields
		if("responseBytes" in ocspResponse)
		{
			if(ocspResponse.responseBytes.responseType === "1.3.6.1.5.5.7.48.1.1") // id-pkix-ocsp-basic
			{
				const asn1 = asn1js.fromBER(ocspResponse.responseBytes.response.valueBlock.valueHex);
				const basicResponse = new BasicOCSPResponse({ schema: asn1.result });
				
				if(basicResponse.tbsResponseData.responderID instanceof RelativeDistinguishedNames)
				{
					this.ocspResponderID = new asn1js.Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [basicResponse.tbsResponseData.responderID.toSchema()]
					});
				}
				else
				{
					this.ocspResponderID = new asn1js.Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [basicResponse.tbsResponseData.responderID]
					});
				}
				
				this.producedAt = basicResponse.tbsResponseData.producedAt;
			}
		}
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
