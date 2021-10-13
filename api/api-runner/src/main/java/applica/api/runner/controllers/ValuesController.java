package applica.api.runner.controllers;

import applica.api.domain.data.RolesRepository;
import applica.api.domain.data.UsersRepository;
import applica.api.domain.model.auth.Role;
import applica.api.domain.model.auth.User;
import applica.framework.Entity;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.library.SimpleItem;
import applica.framework.library.responses.Response;
import applica.framework.library.responses.ValueResponse;
import applica.framework.library.utils.ObjectUtils;
import applica.framework.security.authorization.Permissions;
import applica.framework.widgets.entities.EntitiesRegistry;
import applica.framework.widgets.entities.EntityDefinition;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.ServletRequestParameterPropertyValues;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 3/3/13
 * Time: 11:11 PM
 */
@RestController
@RequestMapping("/values")
public class ValuesController {

    private final RolesRepository rolesRepository;
    private final UsersRepository usersRepository;

    @Autowired
    public ValuesController(RolesRepository rolesRepository, UsersRepository usersRepository) {
        this.rolesRepository = rolesRepository;
        this.usersRepository = usersRepository;
    }

    @RequestMapping("/roles")
    public ValueResponse roles(String keyword) {
        List<Role> roles = rolesRepository.find(
                Query.build()
                        .like("role", keyword)
        ).getRows();

        return new ValueResponse(SimpleItem.createList(roles, "role", "id"));
    }

    @RequestMapping("/permissions")
    public ValueResponse permissions(String keyword) {
        return new ValueResponse(
            SimpleItem.createList(Permissions.instance().allPermissions(), (p) -> (String) p, (p) -> (String) p)
                .stream()
                .filter(l -> StringUtils.isEmpty(keyword) || (l.getLabel() != null && l.getLabel().toLowerCase().contains(keyword)))
                .collect(Collectors.toList())
        );
    }

    @RequestMapping("/users")
    public List<User> users() {
        return usersRepository.find(Query.build()).getRows();
    }

    @GetMapping("/entities/{entityId}")
    public Response entities(@PathVariable String entityId, HttpServletRequest request) {
        try {
            Query query = ObjectUtils.bind(new Query(), new ServletRequestParameterPropertyValues(request));
            Optional<EntityDefinition> definition = EntitiesRegistry.instance().get(entityId);
            if (definition.isPresent()) {
                List<? extends Entity> entities = Repo.of(definition.get().getType()).find(query).getRows();

                return new ValueResponse(entities.stream().map(c -> new SimpleItem(c.toString(), String.valueOf(c.getId()))).collect(Collectors.toList()));
            } else {
                return new Response(Response.ERROR_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new Response(Response.ERROR);
        }
    }

}
