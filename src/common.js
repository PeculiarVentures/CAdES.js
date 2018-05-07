import * as asn1js from "asn1js";
import { utilConcatBuf, getUTCDate } from "pvutils";
import { getCrypto, Attribute } from "pkijs";
import ESSCertIDv2 from "./ESSCertIDv2.js";
import SigningCertificateV2 from "./SigningCertificateV2.js";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
/**
 * Creates common CAdES attributes for given CMS Signed Data
 * @param {SignedData} cmsSigned CMS Signed Data to make attribute for
 * @param {Object} parameters Additional parameters for making attribute
 * @returns {Promise}
 */
export function createCommonAttributes(cmsSigned, parameters)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	let hashAlgorithm = "SHA-256";
	
	let digistedContent = new ArrayBuffer(0);
	
	let contentOID;
	
	const resultAttributes = [];
	
	const essCertificate = new ESSCertIDv2();
	//endregion 
	
	//region Get a "crypto" extension 
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("Unable to create WebCrypto object");
	//endregion 
	
	//region Check input parameters 
	if("hashAlgorithm" in parameters)
		hashAlgorithm = parameters.hashAlgorithm;
	
	if(("certificate" in parameters) === false)
		return Promise.reject("Parameter \"certificate\" is mandatory for making common CAdES attributes");
	
	if("contentOID" in parameters)
		contentOID = parameters.contentOID;
	else
		return Promise.reject("Parameter \"contentOID\" is mandatory for making common CAdES attributes");
	//endregion 
	
	//region Prepare "Content type" and "Signing Time" attributes 
	sequence = sequence.then(
		() => {
			//region Create "Content type" attribute 
			const contentTypeAttribute = new Attribute({
				type: "1.2.840.113549.1.9.3",
				values: [
					new asn1js.ObjectIdentifier({ value: contentOID })
				]
			});
			
			resultAttributes.push(contentTypeAttribute);
			//endregion 
			
			//region Create "Signing Time" attribute 
			const signingTimeAttribute = new Attribute({
				type: "1.2.840.113549.1.9.5",
				values: [
					new asn1js.UTCTime({ valueDate: getUTCDate(new Date()) })
				]
			});
			
			resultAttributes.push(signingTimeAttribute);
			//endregion 
		},
		error => Promise.reject(error)
	);
	//endregion 
	
	//region Prepare "Message digest" attribute 
	sequence = sequence.then(
		() => {
			//region Prepare buffer for making digest 
			if("eContent" in cmsSigned.encapContentInfo) // Attached data
			{
				if((cmsSigned.encapContentInfo.eContent.idBlock.tagClass === 1) &&
					(cmsSigned.encapContentInfo.eContent.idBlock.tagNumber === 4))
				{
					if(cmsSigned.encapContentInfo.eContent.idBlock.isConstructed === false)
						digistedContent = cmsSigned.encapContentInfo.eContent.valueBlock.valueHex;
					else
					{
						for(let i = 0; i < cmsSigned.encapContentInfo.eContent.valueBlock.value.length; i++)
							digistedContent = utilConcatBuf(digistedContent, cmsSigned.encapContentInfo.eContent.valueBlock.value[i].valueBlock.valueHex);
					}
				}
				else
					digistedContent = cmsSigned.encapContentInfo.eContent.valueBlock.valueHex;
			}
			else // Detached data
			{
				if(("content" in parameters) === false)
					return Promise.reject("Please provide \"content\" parameter");
				
				digistedContent = parameters.content;
			}
			//endregion 
			
			return crypto.digest({ name: hashAlgorithm }, digistedContent);
		},
		error => Promise.reject(error)
	).then(
		result => {
			//region Create signed attribute with "message digest" value 
			const attribute = new Attribute({
				type: "1.2.840.113549.1.9.4",
				values: [
					new asn1js.OctetString({ valueHex: result })
				]
			});
			//endregion 
			
			resultAttributes.push(attribute);
		},
		error => Promise.reject(error)
	);
	//endregion 
	
	//region Prepare "ESS-signing-certificate-v2" attribute 
	sequence = sequence.then(
		() => essCertificate.fillValues(parameters),
		error => Promise.reject(error)
	).then(
		() => {
			const signingCertificateV2 = new SigningCertificateV2({
				certs: [
					essCertificate
				]
			});
			
			const attribute = new Attribute({
				type: "1.2.840.113549.1.9.16.2.47",
				values: [signingCertificateV2.toSchema()]
			});
			
			resultAttributes.push(attribute);
			
			return resultAttributes;
		},
		error => Promise.reject(error)
	);
	//endregion 
	
	return sequence;
}
//**************************************************************************************
