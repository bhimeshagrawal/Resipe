# Role-based Access Control (RBAC)
# --------------------------------
#
# This example defines an RBAC model for a Pet Store API. The Pet Store API allows
# users to look at pets, adopt them, update their stats, and so on. The policy
# controls which users can perform actions on which resources. The policy implements
# a classic Role-based Access Control model where users are assigned to roles and
# roles are granted the ability to perform some action(s) on some type of resource.
#
# This example shows how to:
#
#	* Define an RBAC model in Rego that interprets role mappings represented in JSON.
#	* Iterate/search across JSON data structures (e.g., role mappings)
#
# For more information see:
#
#	* Rego comparison to other systems: https://www.openpolicyagent.org/docs/latest/comparison-to-other-systems/
#	* Rego Iteration: https://www.openpolicyagent.org/docs/latest/#iteration

package app.rbac

# import data.utils

# By default, deny requests
default allow = false

# Allow chefs to do anything
allow {
	user_is_chef
}

allow {
	some i, j
	user := data.users[i]
    	recipe := data.recipes[j]
	user.id == input.user
	recipe.id == input.recipe
	user.location == recipe.location
}

allow {
	some i
	data.recipes[i].id == input.recipe
	data.recipes[i].location = input.location
}

# Allow bob to do anything
#allow {
#	input.user == "bob"
#}

# you can ignore this rule, it's simply here to create a dependency
# to another rego policy file, so we can demonstate how to work with
# an explicit manifest file (force order of policy loading).
#allow {
#	input.matching_policy.grants
#	input.roles
#	utils.hasPermission(input.matching_policy.grants, input.roles)
#}

# user_is_chef is true if...
user_is_chef {
	some i
	data.users[i].id == input.user
	data.users[i].karma > 49
}
