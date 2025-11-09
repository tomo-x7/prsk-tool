

export async function calc(p: number) {}

async function fetchData() {
	const body=await fetch("http://prsk-tool.tomo-x.win/p-calc/index.csv").then((r) => r.body);
	if(body==null)return null;
	const stream=body.pipeThrough(new TextDecoderStream())
	const reader=stream.getReader();
	let cur="";
	let stat:"new"|"skip"="new"
	const result:number[]=[]
	while(true){
		const {done,value}=await reader.read();
		if(done)break;
		for(let i=0;i<value.length;i++){
			if(value[i]==="\n"){
				stat="new"
			}else if(stat==="skip"){
				continue;
			}else if(value[i]===","){
				const num=Number.parseInt(cur,10)
				if(!Number.isNaN(num))result.push(num);
				cur="";
				stat="skip"
			}else{
				cur+=value[i];
			}
		}
	}
	if(stat==="new"&&(cur)){
		const num=Number.parseInt(cur,10)
		if(!Number.isNaN(num))result.push(num);
	}
	return result;
}
fetchData().then(d=>console.log(d?.length))