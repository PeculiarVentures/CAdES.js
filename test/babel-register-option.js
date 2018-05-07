require("babel-register")({
	ignore: (fileName) =>
	{
		if(fileName.includes("node_modules"))
		{
			switch(true)
			{
				case fileName.includes("pkijs"):
				case fileName.includes("asn1js"):
				case fileName.includes("pvutils"):
					return false;
				default:
					return true;
			}
		}
		
		return false;
	}
});