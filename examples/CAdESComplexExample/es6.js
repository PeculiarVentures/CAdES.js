/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { getUTCDate, stringToArrayBuffer, utilConcatBuf, arrayBufferToString, toBase64, bufferToHexCodes } from "pvutils";
import {
	getCrypto,
	getAlgorithmParameters,
	setEngine,
	OCSPResponse,
	OCSPRequest,
	SingleResponse,
	ResponseData,
	BasicOCSPResponse,
	Certificate,
	ResponseBytes,
	SignerInfo,
	SignedData,
	EncapsulatedContentInfo,
	ContentInfo,
	TimeStampResp,
	TimeStampReq,
	MessageImprint,
	AlgorithmIdentifier,
	PKIStatusInfo,
	IssuerAndSerialNumber,
	SignedAndUnsignedAttributes,
	TSTInfo,
	OtherRevocationInfoFormat,
	GeneralName,
	Attribute,
	CertificateRevocationList } from "pkijs";
import {
	ESSCertIDv2,
	SigningCertificateV2,
	ATSHashIndex,
	createCommonAttributes,
	ArchiveTimeStampV3,
	SignatureTimeStamp,
	CAdESCTimestamp,
	CompleteCertificateReferences,
	CompleteRevocationReferences,
	CrlOcspRef,
	CertificateValues,
	RevocationValues,
	AttributeCAdES } from "../../src/index.js";
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

let cmsSignedBuffer = new ArrayBuffer(0);

//region Pre-defined constants
const CAcert = "MIIDRDCCAi6gAwIBAgIBATALBgkqhkiG9w0BAQUwODE2MAkGA1UEBhMCVVMwKQYD\
    VQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEz\
    MTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIA\
    UABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMIIBIjANBgkqhkiG9w0B\
    AQEFAAOCAQ8AMIIBCgKCAQEAt7lVuOo+t6Npw9Bzbpn/Pi7to2oSX+P4QAy+u47i\
    Jt9yVU37wKsYZ06TdXNDB8i1nyJbDE4o6/txZQkCa3qU3zDvOhm1JQvLvdjudeQc\
    rnt7Lqag2Uq1w0/fu/vweprHQC5mBxFgI6vkMH1Z42KQfKhe+6Lb9SKfREa8eU9W\
    qh1xg31BdcBHKLalQc1Lf2tCfyiKNiUGqJ3yDJ5r2IKbjbtytrdRvSavRskPZ/ej\
    vzKBdcp7Af87DBbEPV+EaU2jOD6X/zY2TxQpOaz44BqhZDsAubkfcP5W03s7M+h2\
    WkzuRd5yTvq1iOob/QUQ18mR/X1Ks8Tp3Ce6vx3ambq3JwIDAQABo10wWzAMBgNV\
    HRMEBTADAQH/MAsGA1UdDwQEAwIABjAdBgNVHQ4EFgQUMyfkbvtLmn6xw5XGPy9k\
    I87ZW4gwHwYDVR0jBBgwFoAUMyfkbvtLmn6xw5XGPy9kI87ZW4gwCwYJKoZIhvcN\
    AQEFA4IBAQBfvKl+lr4AKmkBgzkEzOoWLvLlyfw/wPPV5vqFpzVqTcQ3QbamwIvw\
    C/+GEwdVQ/0YUb8MSeRccEeiU0Wnnjz8UG20SjycryWuLW+6+XCT9T5VxdgesD4D\
    CEx5GQsKW8JqVwuCg2EPvDd2/yM4Ii0mcYSlgmVGE6POgpDnynMwOj2xrKXbhIXR\
    OM/MBjZwREYrNeVunycrSir5ueG8LL2Kg7ARFawn1+9VdX5GHuWa+zDBFMwVl1Lw\
    tzfu9960l3sb8waAFL+TtRiGAn86M2nzPvzW9l+kvVsA1vrX5AT+ogw0UnMMIqbA\
    jWnW/iR6yp4PTi2qY3yWFt4QfsDu7w2U";

const CAkey = "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC3uVW46j63o2nD\
    0HNumf8+Lu2jahJf4/hADL67juIm33JVTfvAqxhnTpN1c0MHyLWfIlsMTijr+3Fl\
    CQJrepTfMO86GbUlC8u92O515Byue3supqDZSrXDT9+7+/B6msdALmYHEWAjq+Qw\
    fVnjYpB8qF77otv1Ip9ERrx5T1aqHXGDfUF1wEcotqVBzUt/a0J/KIo2JQaonfIM\
    nmvYgpuNu3K2t1G9Jq9GyQ9n96O/MoF1ynsB/zsMFsQ9X4RpTaM4Ppf/NjZPFCk5\
    rPjgGqFkOwC5uR9w/lbTezsz6HZaTO5F3nJO+rWI6hv9BRDXyZH9fUqzxOncJ7q/\
    HdqZurcnAgMBAAECggEBAKGtpoNRGJowY13frgVx3c2SLKw3Jy5dhtSOoraZWelN\
    j+cD9n0p1BLtchTUtvM9rJ7689bTXW2126dHE2sT97il7pBZmTCdvdE2+zqh4J+n\
    qNJ37mrqNSRIwSJD5u9uD9QqQL0NjGY32VrWpOjWj0I0RUn6msiRjEjgWvICYMjY\
    G/GBwpiSWQRF8qxxeGO+eN7LLCt1u/63NPAHoshMHdowjckbSIhQikjNFaFajN1z\
    uTxfejGV1iyBvI3ZmQKZtLgohQkuMU6uZrUaxRToH92Dxnw99P5nPMxWhqZRhuz0\
    NAZNQ9FyA4TBdgD2uiBkJ0X7XDwtF8AJRmD/Ps1NClECgYEA5iQzgJbSfdNsn2YT\
    Mu38CtBNwhSd8o1/ZOabGqFWBNKwvV9L5wC80luXremWCeruyJfgfjgN72TNcruq\
    Se0mp4uRWQzQ+JOBW6O1XKxOImZgJXzyrcpR242jMjoAliAQ0dhUHRCTUPZxkZem\
    yIQLwbCrG0zYIgqM0wAR5JJpnxkCgYEAzF363uXgOARMclvrXPgnXRZ4Qyit09EH\
    tfL1pYJNN8dLrM6g0myUv4g//vaY0+SxxnC5i0rax0lO4US+mFD34H8JJpjJu9zA\
    Hya7lUwGZICaFu9cNo0Qr92njMY4KOOJBKNVR5mhmEWoPcDhUy8WwXpvm16XgJWD\
    I1KpS76DED8CgYBtADhkbwrDDaAk3vO46360oHQzuBAXEW2FHLPZqRBUuHV9O+V3\
    Q6Iq/7aXaErn552w5D4vid0PxW6JKNk+qlPkhvYQd0GCelqKTL9ZZUKciGCBYOyP\
    44NhuXPSFiaw8/8DZLJyEae0cQTZMDqOPfxTgJmKFJtJhDWuuhm/aJkeAQKBgQCk\
    Y9CB7e1vgd2we8oWjbK0SXfRpe41nUYTkO0SBn9wp8pypf9tZFQ+wS2hPOFwSNzL\
    oC9QIZVcitZ9lBuwUCkkF2vX9T0I9ahBJpnrnSzjOSM54a6OXuiWXrkBHw1brrOv\
    3Gaj4qu+3gFYM0fM7uriFUejdfJuR1YmWr69o/CvZwKBgQDX6VYnlITY9LQx1Ed9\
    0+s8lYGLVYSlV4e1cB+rE2QV1H+rSmw+2jR+Se7T0jp4vFV/paPJ3Dq7ebYxGnWv\
    Vt5mkOywJJsS0VJxXfBmZehfjZ0lsrnEWxCoDT26zgqlOVaVDwBdcMKJ2VkP+I/f\
    OvYK6PAdNcKye26ME+fv6nJsPw==";

const OCSPcert = "MIID2jCCAsSgAwIBAgIBAjALBgkqhkiG9w0BAQUwODE2MAkGA1UEBhMCVVMwKQYD\
    VQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEz\
    MTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowgaUxgaIwCQYDVQQGEwJVUzAnBgNVBAse\
    IABPAEMAUwBQACAAVABlAHMAdAAgAFMAZQByAHYAZQByMCkGA1UECh4iAFAAZQBj\
    AHUAbABpAGEAcgAgAFYAZQBuAHQAdQByAGUAczBBBgNVBAMeOgBQAGUAYwB1AGwA\
    aQBhAHIAIABWAGUAbgB0AHUAcgBlAHMAIABPAEMAUwBQACAAUwBlAHIAdgBlAHIw\
    ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCkZDGIyJUlWVlmh2nPf5fi\
    id1KTBYIPB/C5wb7Wsu/kwXQrKEJwM/DVTBRyvUDYZAXHOoIRKnP2J7FCVN2G0pz\
    UxE1umw2D5hKd0Nve8WsfoxVgsgXgCAACwEse4yohKs7boGFQLXxx7z0v08YjTdi\
    1Tp/2zAQYa8ZXmQ2waVI/0GfxrWxSJKhPLfsFzJ7Kl7NKSTDpjyEKJeKtqc9OuEd\
    KjkWFjGMXSSwc6cQ1UYh24Fa2SUZpweOarRf9uKnbae0r0GubjqDfEBPl/9jQpQC\
    aHTV7ghN6egaTgoFhyHe7vQ0Kwtl32SkycdceMneLfh1t97F5NqwhjpfUwAD5kCn\
    AgMBAAGjgYQwgYEwCQYDVR0TBAIwADAPBgkrBgEFBQcwAQUEAgUAMBMGA1UdJQQM\
    MAoGCCsGAQUFBwMJMA4GA1UdDwEB/wQEAwIHgDAdBgNVHQ4EFgQUgnLaDjl16KdF\
    v1bvyUFqyB2YkfEwHwYDVR0jBBgwFoAUMyfkbvtLmn6xw5XGPy9kI87ZW4gwCwYJ\
    KoZIhvcNAQEFA4IBAQCvs+JXahBXln2iCgv3y18VAYjPJfpiWT8ns6Poc59BnOQd\
    St4vkSyWCWUkWMkm+LOZxRSdabFzlUvs1/vmz6qK0D0AluKCGPbIXGIIIXC61Aij\
    IFDk/DAznnV9h49y1OxRG3voj6XKXa+idbqjxbkzNkL4Fd7qB8nO2M8gZpL5aNIw\
    dRvP2HGWAbGZM9pDUBmPj4a23mRhRLwN5Ow9ZB9q5jk9zq+WSGSCDoMm0nfe414F\
    2Q5pMUc/pkv/c1DpzdrUCBy+C79/+yWeRHaw8k6WJONGPmAP7jSlDOU5zsq+eER3\
    E/guFPN8b8FbYdRfFoPagv0xUGrkj+djcL5ovQrk";

const OCSPkey = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkZDGIyJUlWVlm\
    h2nPf5fiid1KTBYIPB/C5wb7Wsu/kwXQrKEJwM/DVTBRyvUDYZAXHOoIRKnP2J7F\
    CVN2G0pzUxE1umw2D5hKd0Nve8WsfoxVgsgXgCAACwEse4yohKs7boGFQLXxx7z0\
    v08YjTdi1Tp/2zAQYa8ZXmQ2waVI/0GfxrWxSJKhPLfsFzJ7Kl7NKSTDpjyEKJeK\
    tqc9OuEdKjkWFjGMXSSwc6cQ1UYh24Fa2SUZpweOarRf9uKnbae0r0GubjqDfEBP\
    l/9jQpQCaHTV7ghN6egaTgoFhyHe7vQ0Kwtl32SkycdceMneLfh1t97F5Nqwhjpf\
    UwAD5kCnAgMBAAECggEAN14LlO9B1H+Abdjj2WA3DrSyVIjFzuY5KFLZdiUBhLeG\
    +N57qqZHE5oImTPLS+U7O52gcUJ3Eyr5ZpGai6frbmYm4Lq2IYslFseObej5Dfzd\
    VRukOs4LeRg7v/ioykVMysqQUwoVfaZxTNl2UWWWpvH8Lv3q9UmBSQESraKRAcF0\
    6bsUoWSk7AVZSNsH1Jo3Zdwb8zoO9dqbcBg+zcWGMFq5WufQ/l7wEMO6Z75umFlP\
    W9G0etpZsOcDdBBIcLCLO/0rBVlZtMu2C3CfUuS8ZF5ntpxVadcLB5xPEXZcGMl7\
    Nz0TL1ViJmEliamQVq/B8id3O5IfeqoPsUKdPojXqQKBgQDQ7rXMD/uMDiK9jQ3E\
    kvgin2xfG8dGoMJGSvHx2U40pfRAxFD9qate71A9gdXjlazwoMD6GUg9WdltOwLm\
    1ai7JP3Y1N7pmngykun4f9oJGeWBJx0XAFKleltM7+i6ZA7H5WXAYlMEwvrkZK5d\
    84gZSzNtPv3E0HdNwTEP9FMCuwKBgQDJbMQnVj9w34FSu61Sli/kbZ/Ng+TrbZH6\
    4hWa3aP0mCNhyIHmvvBfbgfC0m33gG8xLp4YyUs9upiUmBaY9Ztbr54Hhqpclmwo\
    d+iBk4h33/pT8fG00XEdyEgdRLCJbN7N81pSJE5GHURcy1W5QowSGuDunBOHJ3jG\
    JNCwUTHpBQKBgBBOgTvjB3P/6nA24Rs1iU5SeQfXSC9X/rGzybxhhHwRc8XWTKfv\
    pSNstCuIxaPUm8HQGh+q93tqVtDyqSBRDrFEitdwjdFXsAfqdX5ipCbPsZzp65hO\
    +yRVL2kK1HQvuQObAN0KD4awnRpUTVOh3T50IxhksTO6PYWBDY48OHpfAoGAR54a\
    qHnsGK//hXEhkUnBQZEQzrvkuyi8TN3yHJxN3XvyqKPoPCkLwoKW09iKLQRHhM80\
    e0+nJw2fjsX80uoRESqCH97r1/vL/R+VVe0lCqpikVJnRIlrlNFPgsiXlGVXWxb5\
    uFccVaW2VuAdXL+imhVggLaR4u5P7PPOF8Lm4hkCgYEAskYkudLuPGCoc2LwchdN\
    mFgIpgANcuILI9fXf4XbLRYYWGpybl6/qxTcsMRapmVeMUPchtDoy5gS4sCHdbPN\
    urNsJ0DVzPHftJZv4BTFEc9Ne54ins2LN0LBtYo5FKDeoR18SB9xZO1FG6N0Tta1\
    pnxyMq7V5WbWWfxri4oVSEI=";

const TSPcert = "MIID/TCCAuegAwIBAgIBAzALBgkqhkiG9w0BAQUwODE2MAkGA1UEBhMCVVMwKQYD\
    VQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEz\
    MTIxMDAwMFoXDTI0MDEzMTIxMDAwMFowgaExgZ4wCQYDVQQGEwJVUzAlBgNVBAse\
    HgBUAFMAUAAgAFQAZQBzAHQAIABTAGUAcgB2AGUAcjApBgNVBAoeIgBQAGUAYwB1\
    AGwAaQBhAHIAIABWAGUAbgB0AHUAcgBlAHMwPwYDVQQDHjgAUABlAGMAdQBsAGkA\
    YQByACAAVgBlAG4AdAB1AHIAZQBzACAAVABTAFAAIABTAGUAcgB2AGUAcjCCASIw\
    DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJwGoaMBqblJ1oHeUgvS2MtE4npJ\
    8d5ApwY4s8JwQSzZIPpg0tqP4lFjlMkWEayGjYGyDQBd7U6g2MpQzUtmpQF2rHQj\
    bXCKuQDduN7ASLhW7Q+Dfck0Ju7kTFxxhEVqL9FP2l9vJ/eGjLB7chS3Cvnno3IA\
    SwmuOHSjyqvF/D8Nydb9ajauiCy6AAtN8SD6i55P/1WrA5W2YsTEBYHR/VgjjhGH\
    yLb7eSpC094SUW2TQd0XZ67yyQGVDh62x6A/SP/mxkjVXrYTyEezVhRflVkxBieC\
    Z/0pjN5ZbFamHqdxrLMenHWzirS2QeOAHbxZk2EP8Yfr9JySSWdaDn15lVcCAwEA\
    AaOBqzCBqDAJBgNVHRMEAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4GA1Ud\
    DwEB/wQEAwIHgDAdBgNVHQ4EFgQU3ZKp3VTQofTGZVxPaanNZe81jUUwMwYDVR0f\
    BCwwKjAooCagJIYiaHR0cDovL3N0cm96aGV2c2t5LmNvbS9yeWFuL3B2LmNybDAf\
    BgNVHSMEGDAWgBQzJ+Ru+0uafrHDlcY/L2QjztlbiDALBgkqhkiG9w0BAQUDggEB\
    AEb9cPlb6cetnoNNJ7nKUhj0Ay+WIuSDRvMRvMD4ON4zLrWUj1I+xUfIhCfRlQYN\
    BOEN5ZKXzyi4rawJnEzMMYkNhJJ66+Qr50YhUAsxYXZmwik/N53ocv2KZYQmW9iv\
    jujW3ngIC7ir/7aVgBoIhF/7wIeZRqt1BIz65jiIJzcrO2h4CEUliqNwkbEjQE5/\
    syTUfAp9fXtko55ZQHjyXwEhSlbDKL8aixmFBZS20IH//LmieVm3Gr0mmoG+Hx84\
    O+SgaUCkuXvPfdbkBz1IdRoI0ObxaFfsQ/wS07CFeHv6vtjoMaWmfauHXnbjHiIz\
    fY9HY1/C9BfL6eaaIUJATZM=";

const TSPkey = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcBqGjAam5SdaB\
    3lIL0tjLROJ6SfHeQKcGOLPCcEEs2SD6YNLaj+JRY5TJFhGsho2Bsg0AXe1OoNjK\
    UM1LZqUBdqx0I21wirkA3bjewEi4Vu0Pg33JNCbu5ExccYRFai/RT9pfbyf3hoyw\
    e3IUtwr556NyAEsJrjh0o8qrxfw/DcnW/Wo2rogsugALTfEg+oueT/9VqwOVtmLE\
    xAWB0f1YI44Rh8i2+3kqQtPeElFtk0HdF2eu8skBlQ4etsegP0j/5sZI1V62E8hH\
    s1YUX5VZMQYngmf9KYzeWWxWph6ncayzHpx1s4q0tkHjgB28WZNhD/GH6/Sckkln\
    Wg59eZVXAgMBAAECggEAJfhjK7VC5am3f0FofCIiyk0IRLRsHSdkvlncPUxuQAjT\
    Qrt/dNshO6ddVRZ+1JqmI1L+YQF6t/Di8VF6tIfVTibgTx80Cfhoj3JmBCeNSvc0\
    l9rrKKT9eJOsla62fuIZovmo7iKx+kYPRP+1wp7NGAYsO5kgqclxScl2kBkNixZh\
    pWUdOaQlw0iUA8lt086muNdviD5EHwyN2IAYyI4hvVrZZqleDmQEY6Ud636WcI/V\
    nkUgkkps1OvWjbgVZxNFqbusyTpqUm8YbmVW0wUMJWtTpsjalcsKEGRJeKKIJM5b\
    Xww3H6i023FXpoVdZhyetEFfjYaEioxIL9vhdmcO6QKBgQDMIHbwwvllOkyRes90\
    Zy228hFs1w2oiNfEnyAkAJ1X+FcAB4yj2Uc5/5Y94Ks9Xsf7dgZnBwXEygqBkQq7\
    AZOUhKFDIWzrwJlDT0f5bOWkBX2O1bGTxOPL9QMOB/TfwQXBRdES6qtG1qvzPiRd\
    F4s+0OlEjuEHwwnSVdZlVX/6uwKBgQDDrPJUCmfshtCjq/+oOHv4+P+hL8Iv7onB\
    x50FwPpwkvoMOZvJ4DkS2tf2j1To1GEkTunbN8rfqbPPF7Or8OwO7gQQOqqJ9m9Z\
    l55WPnjAknQYT5vOWcsXxgDNRTTBpb5Osmjm2bvejM1X6N6OAsDNWZ/Ar25QG+xr\
    gmKO4DfMFQKBgQCXrPPUOHxKLISigOfPra85RiuOfUmH1o7FahvexJoluMEko3ds\
    dFHJldHUjrGO+3OLtQpS2dP+gsZFujmH9Ubsz5RoJlkh4E3BxxJLExCbzPyb+stl\
    aqJ9dcRcU6sv6+RT1YXiEX9NNsw0BRPOHGV6Oo9qQuSQ+Oq+YMvbJinfawKBgAaL\
    ck99SZyPpcrTpelqejsJmQM7JbOUtubUVlwq6DV7tQFTq/JEnaQTzcVhZeWjtNwS\
    B6BdbVutwWXb1RabKEoXi+s/CxUyOOc2OwWHcWJ/g4KMpxlvx2s0JDK5bdpMQOFA\
    9mFCRxZaf0PBdjApx2kW5lD7jSUAyheOdN1ygmtBAoGAA4QauXOixTRiJpVrZUgr\
    hBOXpFszN5ZUyn1jsM4JccTaBBR7+97toxCb+L+qMCpYbEzg43bziyfcF8RMyTQ4\
    xhO9RVKPdxIHn3YUdHydtDYjSDXCwpkZy0B05HarYqiN8SwT3BPdpK7QRj9MML1F\
    PlkFQWgRQ8qjTbH+lqxilrQ=";

const User10cert = "MIIDRTCCAi+gAwIBAgIBCjALBgkqhkiG9w0BAQUwODE2MAkGA1UEBhMCVVMwKQYD\
    VQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDIw\
    MTAwMDAwMFoXDTE2MDIwMTAwMDAwMFowLjEsMAkGA1UEBhMCVVMwHwYDVQQDHhgA\
    VAByAHUAcwB0AGUAZAAgAFUAcwBlAHIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw\
    ggEKAoIBAQDHkigbvBeqP0QiVW0lz+p58YjwffSKM7nGDvXlnj2TJ73lRqhy9U53\
    TWINqrQhHoqR3dYSiBSfTLgnURcDzembIGTGjVcAhMDoKOPLP/EyshewTx54+uBW\
    A1+TrFr/hG/8zSDLc7iONij9HnG2+tvM4/EWlY/PpbqO5YJoa353/bw+bcWgJ/7F\
    foKEZ0cFhj4XOMg5cLgT2EBG5OehJ0x0zL4i9M8QOCvdaAQPJe1psLO3sVGkHtrN\
    5Zo2vsGuEOkHwSbm4mx5OyfaCcDjXkAbsfeC5o7sViBkjOhWc5JDmZVne+Kch8VF\
    sEM8g0kdrKIpCg/fVIyLtRr7bESa7zqJAgMBAAGjaDBmMA4GA1UdDwEB/wQEAwIF\
    4DAzBgNVHR8ELDAqMCigJqAkhiJodHRwOi8vc3Ryb3poZXZza3kuY29tL3J5YW4v\
    cHYuY3JsMB8GA1UdIwQYMBaAFDMn5G77S5p+scOVxj8vZCPO2VuIMAsGCSqGSIb3\
    DQEBBQOCAQEAngwr55El/cHTr0jHfK2zGZCf+3SfL9x1Q9zDx6tmHEhLjl7sm5Z+\
    crg86Cf/PDbBpONtAvgNSeNYCZ2l7PvKgJGvwfrVIU13JJfwJc5NhX0OTc5G9r1U\
    B9OHqEwSUE7owamlqsAM2T/brNZe4tV+YdpndwBhq7q5ZNG0ltpCJhZ/dplb2UOB\
    RfqsWHJH5ftnTKuRqg/n48zijXZ3rE0/W3B8i98UKIsKyw2CX+rGrlTtXePyeqSO\
    7wHRNNyn3YSRoo/Oas8Fyq8CbkjeSwjAuNQ6ZBOz/MO9vSTRU3yOZnfx7f2x7/Ov\
    NuVbUWgQUYno6h/i+0X39njbzfbuFGsm6g==";

const User10key = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHkigbvBeqP0Qi\
    VW0lz+p58YjwffSKM7nGDvXlnj2TJ73lRqhy9U53TWINqrQhHoqR3dYSiBSfTLgn\
    URcDzembIGTGjVcAhMDoKOPLP/EyshewTx54+uBWA1+TrFr/hG/8zSDLc7iONij9\
    HnG2+tvM4/EWlY/PpbqO5YJoa353/bw+bcWgJ/7FfoKEZ0cFhj4XOMg5cLgT2EBG\
    5OehJ0x0zL4i9M8QOCvdaAQPJe1psLO3sVGkHtrN5Zo2vsGuEOkHwSbm4mx5Oyfa\
    CcDjXkAbsfeC5o7sViBkjOhWc5JDmZVne+Kch8VFsEM8g0kdrKIpCg/fVIyLtRr7\
    bESa7zqJAgMBAAECggEATQiUpMgA1n1fPmV9IRhVaMab1kC4MNRwhAvoTL69A91W\
    Rnb0tJMNu61KCP54U0RntpBLfpG6bBcACmUZniVQY8moPJ/4EkIr+DE4ZI8E+k2W\
    KT8RAx/LkkfxD5567aBgXdOMMhw0A+jR/4pN2JSSXU8rE02d2kgdb+UVZlr/0S6Y\
    FSJySACeoBh8eXhq2WELltY4A5Ptzu7+tdZmjBsVa+XLQlP17BlAcvYsJUxu7h7B\
    2bUZ+XexxcuqFXm0VcvbrUMTX8ChkLOks6jHGg57gewfP4zQxaiLcCqD971cSY18\
    w9r/n40w9JkpO8of0w3MLkhEJmTawfI/V7d3JjBR1QKBgQDy5Dam38G+N7AKpG9s\
    eg/IuTfBc26NFnQIq8vYGn2gd14ccZikxit1M5t0/2y/gaykh3Tlv8ibf5h9TrYF\
    OxgK3l9KHCJNz4RtKlu4C8X40EDiwuhKwNqzFGEoFwDY3sXXr/SOXB9qsXkRnzuH\
    pPz7oG/iuD/bAVxOPFMhZhk5bwKBgQDSV21RQ9NyxWnfNVb3W5t8r1vc81NN7LdQ\
    djM3ZJAYBM6qrY2BtqITbdpzw3w3KQng5VcMwAplqjwnRILDJ0jMlRbt4DwVdfBb\
    d1kpkjpcez294ABeMXCBvODFrfkYJW3SU9IjyExBldLOrH8viEZAK9cAgfTVvaoJ\
    1wX2P2qfhwKBgQDrMoutWXy9WiVQmNwAec3w+1F/NOy3GCfyAZFZSIWfrhbmiiVa\
    YT7RtdByIahHZSUtCLHsi6KQ2KRrqp1dQVTNqXkyRT3+hNTh9KNt+5CPl/FM45mW\
    UVs1D6Xo8SVz23xOmGbCt3gAk6v9oWg+uEf0zO2q5+mFg7LDW2zQKZKBZwKBgHke\
    AIN/w7zdseXmR+ptJG46Z3Il5n0DZlb9iOZHkLVT51DeWJItgMwhQF3SXa9BgT+v\
    r11XI2WBDdwqlgUblM7AtpBIwzA0Vi/E3GGUouhnypiP6IZUf40lHmSVlc5ylvc6\
    btFN36MQS2/YYfATzyfaVpYjPsDo0oWR/AvcXl/3AoGBAMWdPX5VYJUpWo+m7zFf\
    tcbm1vz0m3hyFjRyZZPgcDt/nfD4b26PP1sZ3/hiCdwG2X2GeYvC0ytcHzr5PuJr\
    yqRZgYAO8ZuZ2oUGXULaJWC8W25xQ5tpZX5w/uaF+0WNsMxW8nR7QXyaAq8UDmOX\
    HUn/qN0YH9sNU0u7kPm3Cwem";

const User11cert = "MIIDSTCCAjOgAwIBAgIBCzALBgkqhkiG9w0BAQUwODE2MAkGA1UEBhMCVVMwKQYD\
    VQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDIw\
    MTAwMDAwMFoXDTE2MDIwMTAwMDAwMFowMjEwMAkGA1UEBhMCVVMwIwYDVQQDHhwA\
    VQBuAHQAcgB1AHMAdABlAGQAIABVAHMAZQByMIIBIjANBgkqhkiG9w0BAQEFAAOC\
    AQ8AMIIBCgKCAQEAss2M7/e0e+BnmK1ONbjvjN+1tDvvUBan3z/Gv9Qfz3ofvjmQ\
    ph+eaS2p3OWWL/kPWhzOIXv8xYOUtrEwSAUXMlxDSG72tjZoaAPnYRztaqHSC3VV\
    oxjKXk1ca5NCDOzxib/58ac+BoikslL6IA1f1GRq0medroVFmQUrZPxvPSbFE4GT\
    u+95wxIqh85TwudAloDo7gXbNwXWe6sKPDb/D1kPMD3z6jvpUiUbO7zZtpYPGS9p\
    75bt/cga7nbeFeAZ4QyFvFVe/mrnw3GFEFuPaaEHKFoa4Yn9MVs3lEKa8RQstPAG\
    2M5CryMwH6YU/SoF8BMqlK3RqSjY1tPG8u3iaQIDAQABo2gwZjAOBgNVHQ8BAf8E\
    BAMCBeAwMwYDVR0fBCwwKjAooCagJIYiaHR0cDovL3N0cm96aGV2c2t5LmNvbS9y\
    eWFuL3B2LmNybDAfBgNVHSMEGDAWgBQzJ+Ru+0uafrHDlcY/L2QjztlbiDALBgkq\
    hkiG9w0BAQUDggEBABpq0jcOs9BjHBsgRhNwWsnCiRaZMd9abpbddo2InSw4COAd\
    OiC3+Vfp6JNvKfwD+0bPL/oe16wiF2xY3JZbUbnfoUiKkiHRnGZxXatCvPinmAqn\
    H7bVbk/BpJoxqOO06MVK8zPDRJSIetVyGhTCj+j5KLZAA9T4yQaYnkUDd+5QNkyd\
    hC0Ryk6xpilabQdB/Gi0cZWxRXs1CZC47yolSPQNdK0RyEa/fsc2V3l3fCi/thIZ\
    3Y1Djrrovarxlge08ZyF5jq9f6MCByznayT4B5tqdiYBUlyeLLUIaC6t/zxXAXGU\
    Ejqu1Mk3qRQj2AglTRCNppK3H98TUy3rBCLlslA=";

const User11key = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyzYzv97R74GeY\
    rU41uO+M37W0O+9QFqffP8a/1B/Peh++OZCmH55pLanc5ZYv+Q9aHM4he/zFg5S2\
    sTBIBRcyXENIbva2NmhoA+dhHO1qodILdVWjGMpeTVxrk0IM7PGJv/nxpz4GiKSy\
    UvogDV/UZGrSZ52uhUWZBStk/G89JsUTgZO773nDEiqHzlPC50CWgOjuBds3BdZ7\
    qwo8Nv8PWQ8wPfPqO+lSJRs7vNm2lg8ZL2nvlu39yBrudt4V4BnhDIW8VV7+aufD\
    cYUQW49poQcoWhrhif0xWzeUQprxFCy08AbYzkKvIzAfphT9KgXwEyqUrdGpKNjW\
    08by7eJpAgMBAAECggEAS5Nwb/m+cuHeR/1w4mpB7sScNAtlUu/Qkx+M7YZGz9ap\
    1ijUyDLzLTfc5X6xZaObZpZoVmTm6cF9OV9Zrgdgz6uJ0PL+GvSSWuzTfwvQGlM9\
    yhQVV3PiDcwbNWkv8PCyA2x+xDLRl8dn/evux19/0vGC6V5cmujACzbRKcU9a5Xi\
    0lKYN/5omNmJzBMBkbkuiwZ28k9t3kn0syBWek7dtnJUFqOkbayY4JWG5IClXxJZ\
    lPu6pF5PIeDsds9xndO/aC86qTy/NdtVkHK6MDOB0FcgrQKOoLtIRo2H16LWGQll\
    DWduLs+ZfJF5VQs3fnogeC6VcWWnxw8C3zUpLoj10QKBgQDsVuz74a5dNaz9HaCI\
    m6bloiwi2guQXT6VerQvqv4h/idBbdW5cGwRx3/pSUjalz1v11FPJwkBnC78kkUj\
    2cSVmERxKBRjShSPt5tEIOB9ukDrKkuws9KiIvLeAXo1pe1vF5YDTtHbLfAm5rau\
    MXb1qXdxez3aEjt5be63Q6Sk/QKBgQDBrVP7BKO2nZ9DhixfqH8mLI5/Jrmu3+Ef\
    ANy9p1yXVjp+vpfGiakwUG3X1R/taxLvUE8rTBI9OXrlRLGgYjm5pUY4OorbIbS2\
    9Xqbzug4h1dzKqdiVs4SQx0qkcAushj6rOaSgOKSSp6BwUxd0zKnH2e5bqcZv7sI\
    3rJI3W2E3QKBgQDJAJ0JFEWxbIc1ts7joE3vm1+iPIP9QfCKPROmPu1oh7lnQjy1\
    PFINRPkatYNKtbpAtoWmpfJY9jZYBSbceMdi21/KRWYhk82s9WEOLk//Xjr8Rrqd\
    DDMmRkb8XZFMs1QeWZbyNUTx/j3zN+FCgTtFb93wG/rczwjaG48dOmB7GQKBgA81\
    JvT85kX+lnTc4jsYpfM/aGj/h3D9z1V54dtaeuC/OpSdLpm+UXSjvBxIddtUnwX/\
    jlfd/0ijbMz32eK4E8RJ//uGTUTrnp8HI3t8gat+pRU78iy8mC3C61VeYHLKNT/p\
    t6klSaUnCs8xeGedn8qTordiwug4r90Ab4tdJ65ZAoGAWe0fpJOalS3hObnutyVI\
    yCnd3gYoRPra8VBEDPfsQTch1Du45psB//PCwX2vcnlEtUv1rfYjuP+S0+vGl7DK\
    PKzcKYMPeJ8+RTyddUCs3HyPoyTM5Wlq+Ioq54BC8g7DLdWBsgSetT73xaz4UZvk\
    DRHbuIW+qwowf1XQPjH68zk=";

const CRL = "MIIB0jCBvQIBATALBgkqhkiG9w0BAQUwODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIA\
    UABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzFw0xNTA0MjMwNjU0MDNa\
    Fw0xNTA2MzAyMTAwMDBaMCIwIAIBCxcNMTUwNDIzMDY1NDAzWjAMMAoGA1UdFQQD\
    CgEBoC8wLTAKBgNVHRQEAwIBAjAfBgNVHSMEGDAWgBQzJ+Ru+0uafrHDlcY/L2Qj\
    ztlbiDALBgkqhkiG9w0BAQUDggEBAEzWOyWC/0xPO+oo1KcxyZcJ3ltMRW2n7KGF\
    pM7jxXOtRe2udecRx2O9OHLBZiLTDHBUDEVGy/BNMWFRgpWzch0o5Uz/gYJl9Oyi\
    dzy37HwpDE9zi3dldhbPVTRU+b5oqaRCPWgl1XnR/byVRYiLAWFaEP/IplGcFbZm\
    5YO+3lT1rv08IxeKc5tiFrX7LYpxYG7z4RrikZrGrwBwIfmUoYLHsgcCtwrj0wy+\
    zTDPyiuXbhICEflhPWDq+HvEPCVSrHye0u0GOY0BbjOuumgnypGyee+PS7mzHuoP\
    roeG6ocGoDBNZr87xbsjz5eNq/0nkh3kK0RqVfVDbTAUQF+6P8g=";
//endregion
//*********************************************************************************
function formatPEM(pemString)
{
	const stringLength = pemString.length;
	let resultString = "";
	
	for(let i = 0, count = 0; i < stringLength; i++, count++)
	{
		if(count > 63)
		{
			resultString = `${resultString}\r\n`;
			count = 0;
		}
		
		resultString = `${resultString}${pemString[i]}`;
	}
	
	return resultString;
}
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
	
	let ocspPublicKey;
	
	let asn1CertSimpl = asn1js.fromBER(stringToArrayBuffer(atob(OCSPcert)));
	const certSimpl = new Certificate({ schema: asn1CertSimpl.result });
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
				responderID: certSimpl.subject,
				producedAt: getUTCDate(new Date()),
				responses: responses
			}),
			signatureAlgorithm: certSimpl.signatureAlgorithm,
			certs: [certSimpl]
		});
		
		ocspResponse = new OCSPResponse({
			responseStatus: new asn1js.Enumerated({ value: 0 }) // successful
		});
		//endregion 
	});
	
	sequence = sequence.then(() => certSimpl.getPublicKey());
	
	sequence = sequence.then(result =>
	{
		ocspPublicKey = result;
		
		return crypto.importKey("pkcs8",
			stringToArrayBuffer(atob(OCSPkey)),
			{
				name: result.algorithm.name,
				hash: result.algorithm.hash || {}
			},
			true,
			["sign"]);
	});
	
	sequence = sequence.then(result => basicResponse.sign(result, ocspPublicKey.algorithm.hash.name || "SHA-256"));
	
	sequence = sequence.then(() =>
	{
		ocspResponse.responseBytes = new ResponseBytes({
			responseType: "1.3.6.1.5.5.7.48.1.1", // id-pkix-ocsp-basic
			response: new asn1js.OctetString({ valueHex: basicResponse.toSchema().toBER(false) })
		});
		
		return ocspResponse.toSchema().toBER(false);
	});
	
	return sequence;
}
//*********************************************************************************
function getTSPResponse(request)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const genTime = getUTCDate(new Date());
	
	let asn1CertSimpl = asn1js.fromBER(stringToArrayBuffer(atob(TSPcert)));
	const certSimpl = new Certificate({ schema: asn1CertSimpl.result });
	
	const eSSCertIDv2 = new ESSCertIDv2();
	
	let tspKey = {};
	let tspPublicKey;
	
	let cmsSignedSimpl;
	
	let tstInfo;
	
	const signerInfo = new SignerInfo({
		version: 1,
		sid: new IssuerAndSerialNumber({
			issuer: certSimpl.issuer,
			serialNumber: certSimpl.serialNumber
		})
	});
	signerInfo.signedAttrs = new SignedAndUnsignedAttributes({
		type: 0
	});
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	sequence = sequence.then(() => certSimpl.getPublicKey());
	
	sequence = sequence.then(result =>
	{
		tspPublicKey = result;
		
		const parameters = getAlgorithmParameters(result.algorithm.name, "importKey");
		
		return crypto.importKey("pkcs8",
			stringToArrayBuffer(atob(TSPkey)),
			parameters.algorithm,
			true,
			["sign"]);
	});
	
	sequence = sequence.then(result =>
	{
		tspKey = result;
		
		// #region Prepare buffer with combined "messageImprint" and "genTime"
		const asn1GenTime = new asn1js.GeneralizedTime({ valueDate: genTime });
		const buffer = utilConcatBuf(request.messageImprint.toSchema().toBER(false), asn1GenTime.toBER(false));
		// #endregion
		
		return crypto.digest({ name: "SHA-1" }, buffer);
	});
	
	sequence = sequence.then(result =>
	{
		// noinspection JSCheckFunctionSignatures
		const newView = new Uint8Array(result);
		newView[0] = 0x01;
		
		tstInfo = new TSTInfo({
			version: 1,
			policy: "1.1.1.1",
			messageImprint: request.messageImprint,
			serialNumber: new asn1js.Integer({ valueHex: result }),
			genTime: genTime,
			tsa: new GeneralName({
				type: 4,
				value: certSimpl.subject
			})
		});
	});
	
	sequence = sequence.then(() =>
	{
		signerInfo.signedAttrs.attributes.push(new Attribute({
			type: "1.2.840.113549.1.9.3",
			values: [
				new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.9.16.1.4" }) // Time-stamp token
			]
		}));

		signerInfo.signedAttrs.attributes.push(new Attribute({
			type: "1.2.840.113549.1.9.5",
			values: [
				new asn1js.UTCTime({ valueDate: getUTCDate(new Date()) })
			]
		}));
	});
	
	sequence = sequence.then(() => crypto.digest({ name: "SHA-1" }, tstInfo.toSchema().toBER(false)));
	
	sequence = sequence.then(result =>
	{
		signerInfo.signedAttrs.attributes.push(new Attribute({
			type: "1.2.840.113549.1.9.4", // message digest
			values: [
				new asn1js.OctetString({ valueHex: result })
			]
		}));
	});
	
	sequence = sequence.then(() => eSSCertIDv2.fillValues({
		hashAlgorithm: "SHA-1",
		certificate: certSimpl
	})).then(() =>
	{
		const signingCertificateV2 = new SigningCertificateV2({
			certs: [
				eSSCertIDv2
			]
		});
		
		signerInfo.signedAttrs.attributes.push(new Attribute({
			type: "1.2.840.113549.1.9.16.2.47",
			values: [signingCertificateV2.toSchema()]
		}));
	});
	
	sequence = sequence.then(() =>
	{
		cmsSignedSimpl = new SignedData({
			version: 3,
			encapContentInfo: new EncapsulatedContentInfo({
				eContentType: "1.2.840.113549.1.9.16.1.4" // "tSTInfo" content type
				//eContentType: "1.2.840.113549.1.7.1" // "data" content type
			}),
			signerInfos: [signerInfo],
			certificates: [certSimpl]
		});
		
		cmsSignedSimpl.encapContentInfo.eContent = new asn1js.OctetString({ valueHex: tstInfo.toSchema().toBER(false) });
		
		const parameters = getAlgorithmParameters(tspPublicKey.algorithm.name, "sign");
		
		return cmsSignedSimpl.sign(tspKey, 0, parameters.algorithm.hash.name || {});
	});
	
	sequence = sequence.then(() =>
	{
		const tspResponse = new TimeStampResp({
			status: new PKIStatusInfo({
				status: 0 // granted
			}),
			timeStampToken: new ContentInfo({
				contentType: "1.2.840.113549.1.7.2",
				content: cmsSignedSimpl.toSchema(false)
			})
		});
		
		return tspResponse.toSchema().toBER(false);
	});
	
	return sequence;
}
//*********************************************************************************
function parseCMSSigned()
{
	//region Initial check
	if(cmsSignedBuffer.byteLength === 0)
	{
		alert("Nothing to parse!");
		return;
	}
	//endregion
	
	//region Initial activities
	// noinspection InnerHTMLJS
	document.getElementById("cms-dgst-algos").innerHTML = "";
	
	document.getElementById("cms-certs").style.display = "none";
	document.getElementById("cms-crls").style.display = "none";
	
	const certificatesTable = document.getElementById("cms-certificates");
	while(certificatesTable.rows.length > 1)
		certificatesTable.deleteRow(certificatesTable.rows.length - 1);
	
	const crlsTable = document.getElementById("cms-rev-lists");
	while(crlsTable.rows.length > 1)
		crlsTable.deleteRow(crlsTable.rows.length - 1);
	//endregion
	
	//region Decode existing CMS Signed Data
	const asn1 = asn1js.fromBER(cmsSignedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
	
	for(const signerInfo of cmsSignedSimpl.signerInfos)
	{
		if("signedAttrs" in signerInfo)
			signerInfo.signedAttrs.attributes = Array.from(signerInfo.signedAttrs.attributes, element => new AttributeCAdES(element));
		
		if("unsignedAttrs" in signerInfo)
			signerInfo.unsignedAttrs.attributes = Array.from(signerInfo.unsignedAttrs.attributes, element => new AttributeCAdES(element));
	}
	//endregion
	
	//region Put information about digest algorithms in the CMS Signed Data
	const dgstmap = {
		"1.3.14.3.2.26": "SHA-1",
		"2.16.840.1.101.3.4.2.1": "SHA-256",
		"2.16.840.1.101.3.4.2.2": "SHA-384",
		"2.16.840.1.101.3.4.2.3": "SHA-512"
	};
	
	for(let i = 0; i < cmsSignedSimpl.digestAlgorithms.length; i++)
	{
		let typeval = dgstmap[cmsSignedSimpl.digestAlgorithms[i].algorithmId];
		if(typeof typeval === "undefined")
			typeval = cmsSignedSimpl.digestAlgorithms[i].algorithmId;
		
		const ulrow = `<li><p><span>${typeval}</span></p></li>`;
		
		// noinspection InnerHTMLJS
		document.getElementById("cms-dgst-algos").innerHTML = document.getElementById("cms-dgst-algos").innerHTML + ulrow;
	}
	//endregion
	
	//region Put information about encapsulated content type
	const contypemap = {
		"1.3.6.1.4.1.311.2.1.4": "Authenticode signing information",
		"1.2.840.113549.1.7.1": "Data content"
	};
	
	let eContentType = contypemap[cmsSignedSimpl.encapContentInfo.eContentType];
	if(typeof eContentType === "undefined")
		eContentType = cmsSignedSimpl.encapContentInfo.eContentType;
	
	// noinspection InnerHTMLJS
	document.getElementById("cms-encap-type").innerHTML = eContentType;
	//endregion
	
	//region Put information about included certificates
	const rdnmap = {
		"2.5.4.6": "C",
		"2.5.4.10": "O",
		"2.5.4.11": "OU",
		"2.5.4.3": "CN",
		"2.5.4.7": "L",
		"2.5.4.8": "S",
		"2.5.4.12": "T",
		"2.5.4.42": "GN",
		"2.5.4.43": "I",
		"2.5.4.4": "SN",
		"1.2.840.113549.1.9.1": "E-mail"
	};
	
	if("certificates" in cmsSignedSimpl)
	{
		for(let j = 0; j < cmsSignedSimpl.certificates.length; j++)
		{
			let ul = "<ul>";
			
			for(let i = 0; i < cmsSignedSimpl.certificates[j].issuer.typesAndValues.length; i++)
			{
				let typeval = rdnmap[cmsSignedSimpl.certificates[j].issuer.typesAndValues[i].type];
				if(typeof typeval === "undefined")
					typeval = cmsSignedSimpl.certificates[j].issuer.typesAndValues[i].type;
				
				const subjval = cmsSignedSimpl.certificates[j].issuer.typesAndValues[i].value.valueBlock.value;
				
				ul += `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
			}
			
			ul = `${ul}</ul>`;
			
			const row = certificatesTable.insertRow(certificatesTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = bufferToHexCodes(cmsSignedSimpl.certificates[j].serialNumber.valueBlock.valueHex);
			const cell1 = row.insertCell(1);
			// noinspection InnerHTMLJS
			cell1.innerHTML = ul;
		}
		
		document.getElementById("cms-certs").style.display = "block";
	}
	//endregion
	
	//region Put information about included CRLs
	if("crls" in cmsSignedSimpl)
	{
		for(let j = 0; j < cmsSignedSimpl.crls.length; j++)
		{
			if(typeof cmsSignedSimpl.crls[j] !== CertificateRevocationList)
				continue;
			
			let ul = "<ul>";
			
			for(let i = 0; i < cmsSignedSimpl.crls[j].issuer.typesAndValues.length; i++)
			{
				let typeval = rdnmap[cmsSignedSimpl.crls[j].issuer.typesAndValues[i].type];
				if(typeof typeval === "undefined")
					typeval = cmsSignedSimpl.crls[j].issuer.typesAndValues[i].type;
				
				const subjval = cmsSignedSimpl.crls[j].issuer.typesAndValues[i].value.valueBlock.value;
				
				ul += `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
			}
			
			ul = `${ul}</ul>`;
			
			const row = crlsTable.insertRow(certificatesTable.rows.length);
			const cell = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell.innerHTML = ul;
		}
		
		document.getElementById("cms-certs").style.display = "block";
	}
	//endregion
	
	//region Put information about number of signers
	// noinspection InnerHTMLJS
	document.getElementById("cms-signs").innerHTML = cmsSignedSimpl.signerInfos.length.toString();
	//endregion
	
	document.getElementById("cms-signed-data-block").style.display = "block";
}
//*********************************************************************************
function makeCAdESAv3Internal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	let userPublicKey;
	let userPrivateKey;
	
	const dataBuffer = new ArrayBuffer(6);
	const dataView = new Uint8Array(dataBuffer);
	dataView[0] = 0x00;
	dataView[1] = 0x01;
	dataView[2] = 0x02;
	dataView[3] = 0x03;
	dataView[4] = 0x04;
	dataView[5] = 0x05;
	
	let cmsSignedSimpl;
	
	const ocspRequest = new OCSPRequest();
	
	const aTSHashIndex = new ATSHashIndex();
	
	let asn1 = asn1js.fromBER(stringToArrayBuffer(atob(User10cert)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(atob(CAcert)));
	const caCertSimpl = new Certificate({ schema: asn1.result });
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion

	sequence = sequence.then(() => certSimpl.getPublicKey());
	
	sequence = sequence.then(result =>
	{
		userPublicKey = result;
		
		return crypto.importKey("pkcs8",
			stringToArrayBuffer(atob(User10key)),
			{
				name: result.algorithm.name,
				hash: result.algorithm.hash || {}
			},
			true,
			["sign"]);
	});
	
	sequence = sequence.then(result =>
	{
		userPrivateKey = result;
		
		cmsSignedSimpl = new SignedData({
			version: 1,
			encapContentInfo: new EncapsulatedContentInfo({
				eContentType: "1.2.840.113549.1.7.1" // "data" content type
			}),
			signerInfos: [
				new SignerInfo({
					version: 1,
					sid: new IssuerAndSerialNumber({
						issuer: certSimpl.issuer,
						serialNumber: certSimpl.serialNumber
					})
				})
			],
			certificates: [certSimpl]
		});
		
		cmsSignedSimpl.encapContentInfo.eContent = new asn1js.OctetString({ valueHex: dataBuffer });
		
		return createCommonAttributes(cmsSignedSimpl, {
			hashAlgorithm: "SHA-1",
			certificate: certSimpl,
			contentOID: "1.2.840.113549.1.7.1" // "data" content type
		});
	}).then(result =>
	{
		if(("signedAttrs" in cmsSignedSimpl.signerInfos[0]) === false)
			cmsSignedSimpl.signerInfos[0].signedAttrs = new SignedAndUnsignedAttributes({ type: 0 });
		
		for(let i = 0; i < result.length; i++)
			cmsSignedSimpl.signerInfos[0].signedAttrs.attributes.push(result[i]);
	});
	
	sequence = sequence.then(() => cmsSignedSimpl.sign(userPrivateKey, 0, userPublicKey.algorithm.hash.name || {}));
	
	sequence = sequence.then(() => ocspRequest.createForCertificate(certSimpl, {
		hashAlgorithm: "SHA-1",
		issuerCertificate: caCertSimpl
	})).then(() => getOCSPResponse(ocspRequest))
		.then(result =>
		{
			// noinspection JSCheckFunctionSignatures
			asn1 = asn1js.fromBER(result);
			let ocspResponse = new OCSPResponse({ schema: asn1.result });
			
			if(("crls" in cmsSignedSimpl) === false)
				cmsSignedSimpl.crls = [];
			
			const asn1Temp = asn1js.fromBER(ocspResponse.responseBytes.response.valueBlock.valueHex);
			const tempResponse = new BasicOCSPResponse({ schema: asn1Temp.result });
			
			cmsSignedSimpl.crls.push(new OtherRevocationInfoFormat({
				otherRevInfoFormat: ocspResponse.responseBytes.responseType,
				otherRevInfo: tempResponse.toSchema()
			}));
		});
	
	sequence = sequence.then(() => aTSHashIndex.fillValues(cmsSignedSimpl, 0, {
		hashAlgorithm: "SHA-1"
	})).then(() =>
	{
		const archiveTimeStampV3 = new ArchiveTimeStampV3();
		
		return archiveTimeStampV3.getStampingBuffer(cmsSignedSimpl, 0, {
			hashAlgorithm: "SHA-1",
			aTSHashIndex: aTSHashIndex.toSchema().toBER(false)
		});
	}).then(result =>
	{
		const tspRequest = new TimeStampReq({
			version: 1,
			messageImprint: new MessageImprint({
				hashAlgorithm: new AlgorithmIdentifier({
					algorithmId: "1.3.14.3.2.26",
					algorithmParams: new asn1js.Null()
				}),
				hashedMessage: new asn1js.OctetString({ valueHex: result })
			})
		});
		
		return getTSPResponse(tspRequest);
	}).then(result =>
	{
		if(("unsignedAttrs" in cmsSignedSimpl.signerInfos[0]) === false)
		{
			cmsSignedSimpl.signerInfos[0].unsignedAttrs = new SignedAndUnsignedAttributes({
				type: 1 // UnsignedAttributes
			});
		}

		const archiveTimeStampV3 = new ArchiveTimeStampV3({
			aTSHashIndex: aTSHashIndex
		});
		
		const av3Attribute = archiveTimeStampV3.makeAttribute({
			tspResponse: result
		});
		
		cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(av3Attribute);
		
		const cmsContent = new ContentInfo({
			contentType: "1.2.840.113549.1.7.2",
			content: cmsSignedSimpl.toSchema(true)
		});
		
		cmsSignedBuffer = cmsContent.toSchema().toBER(false);
	});
	
	return sequence;
}
//*********************************************************************************
function makeCAdESAv3()
{
	return makeCAdESAv3Internal().then(() =>
	{
		// noinspection InnerHTMLJS
		let resultString = "-----BEGIN CMS-----\r\n";
		resultString += formatPEM(window.btoa(arrayBufferToString(cmsSignedBuffer)));
		resultString += "\r\n-----END CMS-----\r\n\r\n";
		
		// noinspection InnerHTMLJS
		document.getElementById("new_data").innerHTML = resultString;
		
		parseCMSSigned();
	});
}
//*********************************************************************************
function makeCAdESXLInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	let userPublicKey;
	let userPrivateKey;
	
	const dataBuffer = new ArrayBuffer(6);
	const dataView = new Uint8Array(dataBuffer);
	dataView[0] = 0x00;
	dataView[1] = 0x01;
	dataView[2] = 0x02;
	dataView[3] = 0x03;
	dataView[4] = 0x04;
	dataView[5] = 0x05;
	
	let cmsSignedSimpl;

	const signatureTimeStamp = new SignatureTimeStamp();
	const cadesCTimeStamp = new CAdESCTimestamp();
	
	const completeCertificateReferences = new CompleteCertificateReferences();
	const completeRevocationReferences = new CompleteRevocationReferences();
	
	const ocspRequest = new OCSPRequest();
	
	let ocspResponse;
	
	let asn1 = asn1js.fromBER(stringToArrayBuffer(atob(User10cert)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(atob(CAcert)));
	const caCertSimpl = new Certificate({ schema: asn1.result });
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	
	sequence = sequence.then(() => certSimpl.getPublicKey());
	
	sequence = sequence.then(result =>
	{
		userPublicKey = result;
		
		return crypto.importKey("pkcs8",
			stringToArrayBuffer(atob(User10key)),
			{
				name: result.algorithm.name,
				hash: result.algorithm.hash || {}
			},
			true,
			["sign"]);
	});
	
	sequence = sequence.then(result =>
	{
		userPrivateKey = result;
		
		cmsSignedSimpl = new SignedData({
			version: 1,
			encapContentInfo: new EncapsulatedContentInfo({
				eContentType: "1.2.840.113549.1.7.1" // "data" content type
			}),
			signerInfos: [
				new SignerInfo({
					version: 1,
					sid: new IssuerAndSerialNumber({
						issuer: certSimpl.issuer,
						serialNumber: certSimpl.serialNumber
					})
				})
			],
			certificates: [certSimpl]
		});
		
		cmsSignedSimpl.encapContentInfo.eContent = new asn1js.OctetString({ valueHex: dataBuffer });
		
		return createCommonAttributes(cmsSignedSimpl, {
			hashAlgorithm: "SHA-1",
			certificate: certSimpl,
			contentOID: "1.2.840.113549.1.7.1" // "data" content type
		});
	}).then(result =>
	{
		if(("signedAttrs" in cmsSignedSimpl.signerInfos[0]) === false)
			cmsSignedSimpl.signerInfos[0].signedAttrs = new SignedAndUnsignedAttributes({ type: 0 });
		
		for(let i = 0; i < result.length; i++)
			cmsSignedSimpl.signerInfos[0].signedAttrs.attributes.push(result[i]);
	});
	
	sequence = sequence.then(() => cmsSignedSimpl.sign(userPrivateKey, 0, userPublicKey.algorithm.hash.name || {}));
	
	sequence = sequence.then(() => signatureTimeStamp.getStampingBuffer(cmsSignedSimpl, 0, { hashAlgorithm: "SHA-1" }))
		.then(result =>
		{
			return getTSPResponse(new TimeStampReq({
				version: 1,
				messageImprint: new MessageImprint({
					hashAlgorithm: new AlgorithmIdentifier({
						algorithmId: "1.3.14.3.2.26",
						algorithmParams: new asn1js.Null()
					}),
					hashedMessage: new asn1js.OctetString({ valueHex: result })
				})
			}));
		})
		.then(result =>
		{
			if(("unsignedAttrs" in cmsSignedSimpl.signerInfos[0]) === false)
			{
				cmsSignedSimpl.signerInfos[0].unsignedAttrs = new SignedAndUnsignedAttributes({
					type: 1 // UnsignedAttributes
				});
			}
			
			cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(signatureTimeStamp.makeAttribute({ tspResponse: result }));
		});
	
	sequence = sequence.then(() => ocspRequest.createForCertificate(certSimpl, {
		hashAlgorithm: "SHA-1",
		issuerCertificate: caCertSimpl
	})).then(() => getOCSPResponse(ocspRequest))
		.then(result =>
		{
			// noinspection JSCheckFunctionSignatures
			asn1 = asn1js.fromBER(result);
			ocspResponse = new OCSPResponse({ schema: asn1.result });
			
			if(("crls" in cmsSignedSimpl) === false)
				cmsSignedSimpl.crls = [];
			
			const asn1Temp = asn1js.fromBER(ocspResponse.responseBytes.response.valueBlock.valueHex);
			const basicResponse = new BasicOCSPResponse({ schema: asn1Temp.result });
			
			//region Append OCSP certificates into "certificates" array
			if("certs" in basicResponse)
			{
				if(("certificates" in cmsSignedSimpl) === false)
					cmsSignedSimpl.certificates = [];
				
				for(let i = 0; i < basicResponse.certs.length; i++)
					cmsSignedSimpl.certificates.push(basicResponse.certs[i]);
			}
			//endregion
			
			cmsSignedSimpl.certificates.push(caCertSimpl);
		});
	
	//region Append "complete_certificate_references" and "complete_revocation_references" attributes
	sequence = sequence.then(() => completeCertificateReferences.fillValues(cmsSignedSimpl, 0, { hashAlgorithm: "SHA-1", signerCertificate: certSimpl }))
		.then(() =>
		{
			cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(completeCertificateReferences.makeAttribute());
		});
	
	sequence = sequence.then(() => completeRevocationReferences.fillValues(cmsSignedSimpl, 0, { hashAlgorithm: "SHA-1", ocspResponses: [ ocspResponse ] }))
		.then(() =>
		{
			//region Append two "revocation values" for two remaining certificates (for OCSP server and CA)
			completeRevocationReferences.completeRevocationRefs.push(new CrlOcspRef());
			completeRevocationReferences.completeRevocationRefs.push(new CrlOcspRef());
			//endregion
			
			cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(completeRevocationReferences.makeAttribute());
		});
	//endregion

	//region Add "certificate-values" and "revocation-values" attributes
	sequence = sequence.then(() =>
	{
		const certificateValues = new CertificateValues();
		certificateValues.fillValues(cmsSignedSimpl);
		cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(certificateValues.makeAttribute());
		
		const revocationValues = new RevocationValues();
		revocationValues.fillValues(cmsSignedSimpl, {
			ocspResponses: [ ocspResponse.toSchema().toBER(false) ]
		});
		cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(revocationValues.makeAttribute());
	});
	//endregion
	
	//region Add "CAdES-C-Timestamp" attribute
	sequence = sequence.then(() => cadesCTimeStamp.getStampingBuffer(cmsSignedSimpl, 0, {
		hashAlgorithm: "SHA-1",
		signatureTimeStamp,
		completeCertificateReferences,
		completeRevocationReferences
	})).then(result =>
	{
		return getTSPResponse(new TimeStampReq({
			version: 1,
			messageImprint: new MessageImprint({
				hashAlgorithm: new AlgorithmIdentifier({
					algorithmId: "1.3.14.3.2.26",
					algorithmParams: new asn1js.Null()
				}),
				hashedMessage: new asn1js.OctetString({ valueHex: result })
			})
		}));
	}).then(result =>
	{
		cmsSignedSimpl.signerInfos[0].unsignedAttrs.attributes.push(cadesCTimeStamp.makeAttribute({ tspResponse: result }));
	});
	//endregion
	
	//region Make final content
	sequence = sequence.then(() =>
	{
		const cmsContent = new ContentInfo({
			contentType: "1.2.840.113549.1.7.2",
			content: cmsSignedSimpl.toSchema(true)
		});
		
		cmsSignedBuffer = cmsContent.toSchema().toBER(false);
	});
	//endregion
	
	return sequence;
}
//*********************************************************************************
function makeCAdESXL()
{
	return makeCAdESXLInternal().then(() =>
	{
		// noinspection InnerHTMLJS
		let resultString = "-----BEGIN CMS-----\r\n";
		resultString += formatPEM(window.btoa(arrayBufferToString(cmsSignedBuffer)));
		resultString += "\r\n-----END CMS-----\r\n\r\n";
		
		// noinspection InnerHTMLJS
		document.getElementById("new_data").innerHTML = resultString;
		
		parseCMSSigned();
	});
}
//*********************************************************************************
function handleParsingFile(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		event =>
		{
			// noinspection JSUnresolvedVariable
			cmsSignedBuffer = event.target.result;
			parseCMSSigned();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	makeCAdESAv3();
	makeCAdESXL();
	handleParsingFile();
	setEngine();
});
//*********************************************************************************
context("CAdES Complex Example", () =>
{
	it("Making CAdES-A v3 Data", () => makeCAdESAv3Internal().then(() =>
	{
		console.log(`CAdES-A v3 Data: ${toBase64(arrayBufferToString(cmsSignedBuffer))}`);
	}));
	
	it("Making CAdES-XL Data", () => makeCAdESXLInternal().then(() =>
	{
		console.log(`CAdES-XL Data: ${toBase64(arrayBufferToString(cmsSignedBuffer))}`);
	}));
});
//*********************************************************************************
