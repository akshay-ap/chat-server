var getTime=function()
{
	
	var d = new Date(); 
	d.getHours();
	d.getMinutes();
	
	return d.getHours()+":"+d.getMinutes();
}



module.exports=
{
		getTime
}