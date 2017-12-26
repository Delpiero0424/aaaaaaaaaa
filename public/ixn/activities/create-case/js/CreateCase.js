define( function( require ) {

    'use strict';
    
    	var Postmonger = require( 'postmonger' );
    	var $ = require( 'vendor/jquery.min' );	
    	var connection = new Postmonger.Session();
    	var toJbPayload = {};
    	var step = 1; 
	var tokens;
	var endpoints;
	// シナリオID用変数追加
	var scenarioID;
	var Request = require('request');
	var Fuel = require('fuel');
	
    $(window).ready(onRender);

    connection.on('initActivity', function(payload) {
        var priority;

        if (payload) {
            toJbPayload = payload;
            console.log('payload',payload);
            
			//merge the array of objects.
			var aArgs = toJbPayload['arguments'].execute.inArguments;
			var oArgs = {};
			for (var i=0; i<aArgs.length; i++) {  
				for (var key in aArgs[i]) { 
					oArgs[key] = aArgs[i][key]; 
				}
			}
			//oArgs.priority will contain a value if this activity has already been configured:
			priority = oArgs.priority || toJbPayload['configurationArguments'].defaults.priority;            
        }
        
		$.get( "/version", function( data ) {
			$('#version').html('Version: ' + data.version);
		});                

        // If there is no priority selected, disable the next button
        if (!priority) {
            connection.trigger('updateButton', { button: 'next', enabled: false });
        }

		$('#selectPriority').find('option[value='+ priority +']').attr('selected', 'selected');		
		gotoStep(step);
        
    });

    connection.on('requestedTokens', function(data) {
		if( data.error ) {
			console.error( data.error );
		} else {
			tokens = data;
		}        
    });

    connection.on('requestedEndpoints', function(data) {
		if( data.error ) {
			console.error( data.error );
		} else {
			endpoints = data;
		}        
    });

    connection.on('clickedNext', function() {
        step++;
        gotoStep(step);
        connection.trigger('ready');
    });

    connection.on('clickedBack', function() {
        step--;
        gotoStep(step);
        connection.trigger('ready');
    });

    function onRender() {
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Disable the next button if a value isn't selected
        $('#selectPriority').change(function() {
            var priority = getPriority();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(priority) });
        });
    };
	
　　// イベントリクエスト用ファンクション
　　// getDataFromDE(id)をコールしてDEからUIDを取得
    function fireRequest(){
	//ヘッダーを定義
	var headers = {'Content-Type':'application/json'};
	var uid = 'Ubbf28c454f516361872a7c7b58d365f2';
	
	//オプションを定義
	var options = {
	  url: 'https://master.laborot.com/api/push?uid=' + uid + '&cenarioid=22&test=1',
	  method: 'POST',
	  headers: headers,
	  json: true,
	  form: {"hoge":"fuga"}
	};
	
	//リクエスト送信
	var result = request(options, function (error, response, body) {
	  //コールバックで色々な処理
	});
	alert(options);
	alert(result);
    };
　　// DEからデータを取得するファンクション
　　// 引数：ContactID
　　// 戻り値：UID
    function getDataFromDE() {
	 var uid = '';
	 var sid = '22';
	 var authOptions = {
		'clientId': '5u6fn7eblat6hpucl3v63miz',
		'clientSecret': 'wLEeIcqKoT5KgI16LXJ9xmhG',
		'json': true
	 }
	 uid = fuel.createAuthOptions(options);
	 alert(uid);
         return uid;
    };

    function gotoStep(step) {
        $('.step').hide();
        switch(step) {
            case 1:
                $('#step1').show();
                connection.trigger('updateButton', { button: 'next', text: 'next', enabled: Boolean(getPriority()) });
                connection.trigger('updateButton', { button: 'back', visible: false });
                break;
            case 2:
                $('#step2').show();
                $('#showPriority').html(getPriority());
                connection.trigger('updateButton', { button: 'back', visible: true });
                connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
                break;
            case 3: // Only 2 steps, so the equivalent of 'done' - send off the payload
                save();
		fireRequest();
                break;
        }
    };

    function getPriority() {
        return $('#selectPriority').find('option:selected').attr('value').trim();
    };
    
    function save() {

        var value = getPriority();

        // toJbPayload is initialized on populateFields above.  Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property may be overridden as desired.
        //toJbPayload.name = "my activity";

		//this will be sent into the custom activity body within the inArguments array.
        toJbPayload['arguments'].execute.inArguments.push({"priority": value});

		/*
        toJbPayload['metaData'].things = 'stuff';
        toJbPayload['metaData'].icon = 'path/to/icon/set/from/iframe/icon.png';
        toJbPayload['configurationArguments'].version = '1.1'; // optional - for 3rd party to track their customActivity.js version
        toJbPayload['configurationArguments'].partnerActivityId = '49198498';
        toJbPayload['configurationArguments'].myConfiguration = 'configuration coming from iframe';
		*/
		
		toJbPayload.metaData.isConfigured = true;  //this is required by JB to set the activity as Configured.
        connection.trigger('updateActivity', toJbPayload);
    }; 
    	 
});
			
