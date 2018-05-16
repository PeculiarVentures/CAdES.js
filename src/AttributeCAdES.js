import { Attribute } from "pkijs";
import ATSHashIndex from "./ATSHashIndex.js";
import ArchiveTimeStampV3 from "./ArchiveTimeStampV3.js";
import SignatureTimeStamp from "./SignatureTimeStamp.js";
import CompleteCertificateReferences from "./CompleteCertificateReferences.js";
import CompleteRevocationReferences from "./CompleteRevocationReferences.js";
import CAdESCTimestamp from "./CAdESCTimestamp.js";
import CertificateValues from "./CertificateValues.js";
import RevocationValues from "./RevocationValues.js";
import RevocationInfoArchival from "./RevocationInfoArchival.js";
//**************************************************************************************
export default class AttributeCAdES extends Attribute
{
	//**********************************************************************************
	/**
	 * Constructor for SignedAndUnsignedAttributesCAdES class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters)
	{
		super(parameters);
		
		this.initializeParsedValues();
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		super.fromSchema(schema);
		
		this.initializeParsedValues();
	}
	//**********************************************************************************
	initializeParsedValues()
	{
		switch(this.type)
		{
			case "0.4.0.1733.2.5": // ATSHashIndex
				this.parsedValue = new ATSHashIndex({ schema: this.values[0] });
				break;
			case "0.4.0.1733.2.4": // archive-time-stamp-v3
				this.parsedValue = new ArchiveTimeStampV3({ schema: this.values[0] });
				break;
			case "1.2.840.113549.1.9.16.2.14": // signature-time-stamp
				this.parsedValue = new SignatureTimeStamp({ schema: this.values[0] });
				break;
			case "1.2.840.113549.1.9.16.2.21": // complete-certificate-references
				this.parsedValue = new CompleteCertificateReferences({ schema: this.values[0] });
				break;
			case "1.2.840.113549.1.9.16.2.22": // complete-revocation-references
				this.parsedValue = new CompleteRevocationReferences({ schema: this.values[0] });
				break;
			case "1.2.840.113549.1.9.16.2.25": // CAdES-C-Timestamp
				this.parsedValue = new CAdESCTimestamp({ schema: this.values[0] });
				break;
			case "1.2.840.113549.1.9.16.2.23": // certificate-values
				this.parsedValue = new CertificateValues({ schema: this.values[0] });
				break;
			case "1.2.840.113549.1.9.16.2.24": // revocation-values
				this.parsedValue = new RevocationValues({ schema: this.values[0] });
				break;
			case "1.2.840.113583.1.1.8": // Adobe "RevocationInfoArchival"
				this.parsedValue = new RevocationInfoArchival({ schema: this.values[0] });
				break;
			default:
		}
	}
	//**********************************************************************************
}
//**************************************************************************************
