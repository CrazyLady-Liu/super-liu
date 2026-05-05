package com.company.travel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/cities")
@CrossOrigin(origins = "http://localhost:3000")
public class CityController {
    
    private static final List<String> CITIES = Arrays.asList(
        "北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "武汉",
        "西安", "重庆", "天津", "苏州", "长沙", "郑州", "青岛", "大连",
        "沈阳", "哈尔滨", "长春", "济南", "福州", "厦门", "昆明", "贵阳",
        "南宁", "海口", "乌鲁木齐", "兰州", "银川", "西宁", "拉萨", "呼和浩特",
        "石家庄", "太原", "合肥", "南昌", "南宁", "宁波", "无锡", "常州",
        "温州", "佛山", "东莞", "珠海", "中山", "惠州", "泉州", "烟台"
    );
    
    @GetMapping
    public ResponseEntity<List<String>> getAllCities() {
        return ResponseEntity.ok(CITIES);
    }
}
