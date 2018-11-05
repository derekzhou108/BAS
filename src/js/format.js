
(function(root){
	root.format = {
		RealTimePay(object){
			let resData = lodash.cloneDeep(object);
			if(object && object.list){
				delete resData.list;
				resData["list"] =  object.list.map(item => {
					let {date,platform_name,channel_name,server_name,max_online,min_online,max_online_user,min_online_user,data} = item;
					return {
						date,
						platform_name,
						channel_name,
                        server_name,
                        max_online,
                        min_online,
						max_online_user,
						min_online_user,
						data
					};
				});
			}
			return resData;
		}
	};
})(window);