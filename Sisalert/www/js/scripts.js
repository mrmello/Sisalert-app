//lista mais
	$(".listamais .title_listamais").click(function() {
		$(".listamais ul").slideUp();
		$(".listamais .title_listamais").removeClass("acitve_llistamais");
		if ($(this).next("ul").is(":hidden")){
			$(this).next("ul").slideDown();
			$(this).addClass("acitve_llistamais");
		} 
		else {
			$(this).next("ul").slideUp();
			$(this).removeClass("acitve_llistamais");
		}
	});

	//lista mais degrade
	$(".listamaisdeagrade .title_listamais").click(function() {
		$(".listamaisdeagrade ul").slideUp();
		$(".listamaisdeagrade .title_listamais").removeClass("acitve_llistamais");
		if ($(this).next("ul").is(":hidden")){
			$(this).next("ul").slideDown();
			$(this).addClass("acitve_llistamais");
		} 
		else {
			$(this).next("ul").slideUp();
			$(this).removeClass("acitve_llistamais");
		}
	});

	$(".close_modal_bottom, #div_maps").click(function() {
      console.log('aaaaaaaaaa');
    });