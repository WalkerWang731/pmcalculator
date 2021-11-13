function COMP(){
	this.term_target = 0; 		// 目标完成时间
	this.term_target_after = 0; // 超出目标完成时间
	this.term_target_after_cost = 0; // 超出目标后的罚款
	
	this.form_data = [];		// 原始表单数据
	this.crm_links = []; 		// crm产生的link信息
	
	this.to_fixed_count = 1;
	this.term_total = 0;
	
	
	this.calculate = _calculate;
	this.data = [];
	this.compression = [];
	
	
}


function _calculate(){
	
	var _data = [];
	var _cost_avg = [];
	var _compression = [];
	var _term_total = 0;
	
	for(var i in this.crm_links){
		_tmp = {
			'source': this.crm_links[i]['source'],
			'target': this.crm_links[i]['target'],
			'term_normal': this.crm_links[i]['private']['origin_data'][2],
			'term_comp': this.crm_links[i]['private']['origin_data'][3],
			'cost_normal': this.crm_links[i]['private']['origin_data'][4],
			'cost_comp': this.crm_links[i]['private']['origin_data'][5],
			'key_path': this.crm_links[i]['private']['iskey'],
			'cost_order': '不可压缩',
		}
		_tmp['term_save'] = _tmp['term_normal'] - _tmp['term_comp']
		_tmp['cost_comp_really'] = _tmp['cost_comp'] - _tmp['cost_normal']
		_tmp['cost_avg'] = _tmp['cost_comp_really'] / _tmp['term_save']
		
		if(this.crm_links[i]['private']['iskey'] == true){
			_term_total += this.crm_links[i]['private']['term']
			_tmp['cost_order'] = 0;
			_cost_avg.push(_tmp['cost_avg'])
		}
		_data.push(_tmp);
	}
	this.term_total = _term_total;
	
	// 计算压缩顺序
	_cost_avg.sort()
	console.log('_cost_avg', _cost_avg)
	for (var i in _cost_avg){
		for(var j in _data){
			if(this.crm_links[j]['private']['iskey'] == false){
				continue
			}
			if(_data[j]['cost_avg'] == _cost_avg[i] && _data[j]['cost_order'] == 0){
				_data[j]['cost_order'] = parseInt(i) + 1
				_compression.push(_data[j])
				break
			}
		}
	}
	this.data = _data;
	
	
	var _cost_comp_total = 0;
	var _minimum_cost = (_term_total - this.term_target_after) * this.term_target_after_cost;
	
	// 压缩边际成本计算
	for (var i in _compression){
		
		if (_term_total <= this.term_target){
			break
		}
		_compression[i]['term_total'] = _term_total - _compression[i]['term_save']											// 预计总工时
		_compression[i]['cost_comp_total'] = _cost_comp_total + _compression[i]['cost_comp_really']							// 累计压缩成本
		_compression[i]['cost_compensation'] = (_compression[i]['term_total'] - this.term_target_after) * this.term_target_after_cost			// 累计赔偿
		if (_compression[i]['cost_compensation'] < 0){
			_compression[i]['cost_compensation'] = 0
		}
		_compression[i]['cost_really_total'] = _compression[i]['cost_comp_total'] + _compression[i]['cost_compensation']	// 累计实际成本
		_compression[i]['cost_marginal'] = false;
		
		if (_compression[i]['cost_really_total'] < _minimum_cost){
			_minimum_cost = _compression[i]['cost_really_total']
		}
		
		console.log(i, _compression[i], _cost_comp_total, _minimum_cost)
		
		_cost_comp_total = _compression[i]['cost_comp_total']
		_term_total = _compression[i]['term_total']
		
	}
	
	for (var i in _compression){
		if (_compression[i]['cost_really_total'] == _minimum_cost){
			_compression[i]['cost_marginal'] = true;
		}
	}
	
	this.compression = _compression;
	
	
}
