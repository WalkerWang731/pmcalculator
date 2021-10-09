function PERT(){
	this.crm_list = [];			// 计算后的标准crm数据
	this.term_target = 0; 		// 目标完成时间
	
	this.term_avg = 0; 			// 项目平均值
	this.term_dev_std = 0;		// 项目标准偏差
	
	this.term_avg_dev = 0;		// 项目平均差
	this.term_avg_dev_std = 0;	// 项目标准平均差
	
	this.detail_data = [];		// 每个子项目所有值
	
	this.crm_links = []; 		// crm产生的link信息
	
	this.to_fixed_count = 1;
	
	this.add_data = _add_data;
	this.render_crm_list = _render_crm_list;
	this.convert_num = _convert_num;
	this.calculate_term = _calculate_term;
}


function _calculate_term(){
	var term_avg_sum = 0;
	var term_dev_std_sum = 0;
	
	// 项目平均值 项目标准偏差
	for(var i in this.crm_links){
		if(this.crm_links[i]['private']['iskey'] == false){
			continue
		}
		term_avg_sum += this.convert_num(this.crm_links[i]['private']['origin_data'][3]['term_beta_avg'])
		term_dev_std_sum += this.convert_num(this.crm_links[i]['private']['origin_data'][3]['term_beta_sd']**2)
	}
	this.term_avg = term_avg_sum;
	this.term_dev_std = this.convert_num(Math.sqrt(term_dev_std_sum))
	
	// 项目平均差 标准平均差
	this.term_avg_dev = this.convert_num(this.term_target - this.term_avg)
	this.term_avg_dev_std = this.convert_num(this.term_avg_dev / this.term_dev_std)
}


function _add_data(data){
	var tmp_data = {
		'source': data[0].toUpperCase(),
		'target': data[1].toUpperCase(),
		'term_a': parseInt(data[2]),
		'term_m': parseInt(data[3]),
		'term_b': parseInt(data[4])
	}
	// 计算贝塔平均值(工作平均期限)
	tmp_data['term_beta_avg'] = this.convert_num((tmp_data['term_a'] + (4 * tmp_data['term_m']) + tmp_data['term_b']) / 6)
	
	// 计算贝塔SD(工作标准偏差)
	tmp_data['term_beta_sd'] = this.convert_num((tmp_data['term_b'] - tmp_data['term_a']) / 6)
	
	this.detail_data.push(tmp_data)
}


function _render_crm_list(){
	for(var i in this.detail_data){
		this.crm_list.push([this.detail_data[i]['source'], this.detail_data[i]['target'], this.detail_data[i]['term_beta_avg'], this.detail_data[i]])
	}
}


function _convert_num(num){
	if(this.to_fixed_count == 0){
		var _n = parseInt(num.toFixed(this.to_fixed_count))
	}else{
		var _n = parseFloat(num.toFixed(this.to_fixed_count))
	}
	return _n
}