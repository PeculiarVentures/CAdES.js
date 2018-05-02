import * as asn1js from "asn1js";
import { getUTCDate } from "pvutils";
import { getCrypto } from "pkijs/src/common.js";
import OCSPResponse from "pkijs/src/OCSPResponse.js";
import SingleResponse from "pkijs/src/SingleResponse.js";
import ResponseData from "pkijs/src/ResponseData.js";
import BasicOCSPResponse from "pkijs/src/BasicOCSPResponse.js";
//<nodewebcryptoossl>
//*********************************************************************************
const validCertificates = [
	1, // CA certificate
	2, // OCSP Server certificate
	3, // TSP Server certificate
	10 // End-user certificate #1
];

const invalidCertificates = [
	11 // End-user certificate #2
];
//*********************************************************************************
/**
 * Generate OCSP response as a consiquence for OCSP request
 * @param {OCSPRequest} request
 * @return {Promise}
 */
function getOCSPResponse(request)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const responses = [];
	
	let basicResponse;
	let ocspResponse;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	sequence = sequence.then(() => 
	{
		//region Get making OCSP response for each certificate in the request 
		for(let i = 0; i < request.tbsRequest.requestList.length; i++)
		{
			//region Initial variables 
			let valid = false;
			//endregion 
			
			//region Check the certificate for "to be valid" 
			for(let j = 0; j < validCertificates.length; j++)
			{
				if(request.tbsRequest.requestList[i].reqCert.serialNumber.valueBlock.valueDec === validCertificates[j])
				{
					valid = true;
					
					const response = new SingleResponse({
						certID: request.tbsRequest.requestList[i].reqCert,
						certStatus: new asn1js.Primitive({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							lenBlockLength: 1 // The length contains one byte 0x00
						}),
						thisUpdate: getUTCDate(new Date())
					});
					
					responses.push(response);
				}
			}
			//endregion 
			
			//region Check the certificate for "to be invalid" 
			if(!valid)
			{
				for(let j = 0; j < invalidCertificates.length; j++)
				{
					if(request.tbsRequest.requestList[i].reqCert.serialNumber.valueBlock.valueDec === invalidCertificates[j])
					{
						const response = new SingleResponse({
							certID: request.tbsRequest.requestList[i].reqCert,
							certStatus: new asn1js.Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagMumber: 1 // [1]
								},
								value: [
									new asn1js.GeneralizedTime({ valueDate: getUTCDate(new Date(2014, 0, 1)) }),
									new asn1js.Constructed({
										idBlock: {
											tagClass: 3, // CONTEXT-SPECIFIC
											tagNumber: 0 // [0]
										},
										value: [new asn1js.Enumerated({ value: 1 })] // keyCompromise
									})
								]
							}),
							thisUpdate: getUTCDate(new Date())
						});
						
						responses.push(response);
					}
				}
			}
			//endregion 
		}
		//endregion 
		
		//region Making final OCSP response object 
		basicResponse = new BasicOCSPResponse({
			tbsResponseData: new ResponseData({
				responderID: cert_simpl.subject,
				producedAt: getUTCDate(new Date()),
				responses: responses
			}),
			signatureAlgorithm: cert_simpl.signatureAlgorithm,
			certs: [cert_simpl]
		});
		
		ocspResponse = new OCSPResponse({
			responseStatus: new asn1js.Enumerated({ value: 0 }) // successful
		});
		//endregion 
	});
	
	return sequence;
}
//*********************************************************************************
