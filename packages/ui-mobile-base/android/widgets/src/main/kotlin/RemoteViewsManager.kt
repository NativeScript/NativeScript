package org.nativescript.widgets

class RemoteViewsManager {
	private val nodes = mutableMapOf<String, RemoteViews>()
	private val parents = mutableMapOf<String, String?>()
	private val children = mutableMapOf<String, MutableList<String>>()

	fun add(node: RemoteViews, parentId: String? = null) {
		val id = node.id
		node.manager = this
		nodes[id] = node
		parents[id] = parentId
		children[id] = mutableListOf()

		// register as child of parent
		parentId?.let { children[it]?.add(id) }
	}

	fun remove(id: String) {
		// detach from parent
		parents[id]?.let { parentId ->
			children[parentId]?.remove(id)
		}
		// reparent children to null or could reparent to grandparent
		children[id]?.forEach { childId ->
			parents[childId] = null
		}
		nodes[id]?.manager = null
		nodes.remove(id)
		parents.remove(id)
		children.remove(id)
	}

	fun reparent(id: String, newParentId: String?) {
		// detach from old parent
		parents[id]?.let { oldParentId ->
			children[oldParentId]?.remove(id)
		}
		// attach to new parent
		parents[id] = newParentId
		newParentId?.let { children[it]?.add(id) }
	}

	fun getById(id: String): RemoteViews? = nodes[id]

	fun findViewById(parentId: String, targetId: String): RemoteViews? {
		if (parentId == targetId) return nodes[parentId]
		children[parentId]?.forEach { childId ->
			if (childId == targetId) return nodes[childId]
			val found = findViewById(childId, targetId)
			if (found != null) return found
		}
		return null
	}

	fun getChildren(id: String): List<RemoteViews> {
		return children[id]?.mapNotNull { nodes[it] } ?: emptyList()
	}

	fun getParent(id: String): RemoteViews? {
		return parents[id]?.let { nodes[it] }
	}

	fun resolveRemoteResources() {
		for (node in nodes.values) {
			val iterator = node.commands.entries.iterator()
			val resolved = mutableMapOf<String, RemoteViews.Command>()
			while (iterator.hasNext()) {
				val entry = iterator.next()
				val cmd = entry.value
				if (cmd is RemoteViews.Command.SetImageUrl) {
					val bitmap = cmd.resolve()
					if (bitmap != null) {
						resolved[entry.key] = bitmap
					} else {
						iterator.remove()
					}
				}
			}
			node.commands.putAll(resolved)
		}
	}

	fun build(packageName: String): android.widget.RemoteViews? {
		val rootId = parents.entries.firstOrNull { it.value == null }?.key ?: return null
		val root = nodes[rootId] ?: return null
		return buildNode(rootId, packageName, root)
	}

	fun build(rootId: String, packageName: String): android.widget.RemoteViews? {
		val root = nodes[rootId] ?: return null
		return buildNode(rootId, packageName, root)
	}

	private fun buildNode(
		id: String,
		packageName: String,
		node: RemoteViews
	): android.widget.RemoteViews {
		val rv = node.buildSelf(packageName)
		children[id]?.forEach { childId ->
			val childNode = nodes[childId] ?: return@forEach
			val childRv = buildNode(childId, packageName, childNode)
			rv.addView(node.stableId!!, childRv)
		}
		return rv
	}
}
