<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class='bg-black'>
	{@render children()}
</div>

