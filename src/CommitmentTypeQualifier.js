import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
export default class CommitmentTypeQualifier
{
	//**********************************************************************************
	/**
	 * Constructor for CommitmentTypeQualifier class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description commitmentTypeIdentifier
		 */
		this.commitmentTypeIdentifier = getParametersValue(parameters, "commitmentTypeIdentifier", CommitmentTypeQualifier.defaultValues("commitmentTypeIdentifier"));
		/**
		 * @type {*}
		 * @description qualifier
		 */
		this.qualifier = getParametersValue(parameters, "qualifier", CommitmentTypeQualifier.defaultValues("qualifier"));
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
			case "commitmentTypeIdentifier":
				return "";
			case "qualifier":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for CommitmentTypeQualifier class: ${memberName}`);
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
			case "commitmentTypeIdentifier":
				return (memberValue === "");
			case "qualifier":
				return (memberValue instanceof asn1js.Any);
			default:
				throw new Error(`Invalid member name for CommitmentTypeQualifier class: ${memberName}`);
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
		// CommitmentTypeQualifier ::= SEQUENCE {
		//    commitmentTypeIdentifier CommitmentTypeIdentifier,
		//    qualifier ANY DEFINED BY commitmentTypeIdentifier }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [commitmentTypeIdentifier]
		 * @property {string} [qualifier]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.commitmentTypeIdentifier || "") }),
				new asn1js.Any({
					name: (names.qualifier || "")
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
			CommitmentTypeQualifier.schema({
				names: {
					commitmentTypeIdentifier: "commitmentTypeIdentifier",
					qualifier: "qualifier"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CommitmentTypeQualifier");
		//endregion
		
		//region Get internal properties from parsed schema
		this.commitmentTypeIdentifier = asn1.result.commitmentTypeIdentifier.valueBlock.toString();
		this.qualifier = asn1.result.qualifier;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(CommitmentTypeQualifier.compareWithDefault("qualifier", this.qualifier))
			throw new Error("Member \"qualifier\" was not correctly initialized");
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.commitmentTypeIdentifier }),
				this.qualifier
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
		if(CommitmentTypeQualifier.compareWithDefault("qualifier", this.qualifier))
			throw new Error("Member \"qualifier\" was not correctly initialized");
		
		return {
			commitmentTypeIdentifier: this.commitmentTypeIdentifier,
			qualifier: this.qualifier.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
