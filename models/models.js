const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: true,
        defaultValue: 'user'
    },
    coins: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    ton: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const Element = sequelize.define('element', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rare: {
        type: DataTypes.ENUM("Обычная", "Редкая", "Эпическая"),
        defaultValue: false,
        defaultValue: "Обычная"
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    forLaboratory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
})

const Planeta = sequelize.define('planet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    speed: {
        type: DataTypes.FLOAT,
        defaultValue: 0.00005,
        allowNull: true
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false
    },
    elementId: {
        type: DataTypes.INTEGER,
        references: {
            model: Element,
            key: 'id'
        },
        allowNull: false
    }
})

const UserResource = sequelize.define('user_resource', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    elementId: {
        type: DataTypes.INTEGER,
        references: {
            model: Element,
            key: 'id'
        },
        allowNull: false
    }
});

const ElementLevelAndSpeed = sequelize.define('element_level_and_speed', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    speed: {
        type: DataTypes.FLOAT,
        defaultValue: 0.00005,
        allowNull: true
    },
    protection: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    elementId: {
        type: DataTypes.INTEGER,
        references: {
            model: Element,
            key: 'id'
        },
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    }
})

const Spaceports = sequelize.define('spaceports', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    }
})

const Ship = sequelize.define('ship', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true
    },
    image:{
        type: DataTypes.STRING,
        allowNull: false
    },
    attributes: {
        type: DataTypes.JSON,
        allowNull: false
    },
    index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    spaceportsId: {
        type: DataTypes.STRING,
        references: {
            model: Spaceports,
            key: 'id'
        },
        allowNull: false
    }
})

const Alliance = sequelize.define('alliance', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    members: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
        defaultValue: [],
        allowNull: false
    },
    elementId: {
        type: DataTypes.INTEGER,
        references: {
            model: Element,
            key: 'id'
        },
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    }
})

const Tasks = sequelize.define('tasks', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    desc: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resource: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const UserTasks = sequelize.define('user_tasks', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    taskId: {
        type: DataTypes.STRING,
        references: {
            model: Tasks,
            key: 'id'
        },
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
})

User.hasOne(Spaceports, { foreignKey: 'userId' })
Spaceports.belongsTo(User, { foreignKey: 'userId' })

Element.hasOne(Planeta, { foreignKey: 'elementId' });
Planeta.belongsTo(Element, { foreignKey: 'elementId' });

User.hasOne(UserResource, { foreignKey: 'userId' });
UserResource.belongsTo(User, { foreignKey: 'userId' });

Element.hasOne(UserResource, { foreignKey: 'elementId' });
UserResource.belongsTo(Element, { foreignKey: 'elementId' });
 
User.hasOne(ElementLevelAndSpeed, { foreignKey: 'userId' });
ElementLevelAndSpeed.belongsTo(User, { foreignKey: 'userId' });

Element.hasOne(ElementLevelAndSpeed, { foreignKey: 'elementId' });
ElementLevelAndSpeed.belongsTo(Element, { foreignKey: 'elementId' });

User.hasOne(Alliance, { foreignKey: 'userId' });
Alliance.belongsTo(User, { foreignKey: 'userId' });

Element.hasOne(Alliance, { foreignKey: 'elementId' });
Alliance.belongsTo(Element, { foreignKey: 'elementId' });

User.hasOne(Spaceports, { foreignKey: 'userId' });
Spaceports.belongsTo(User, { foreignKey: 'userId' });

Spaceports.hasMany(Ship, { foreignKey: 'spaceportsId' });
Ship.belongsTo(Spaceports, { foreignKey:'spaceportsId' });

User.hasMany(UserTasks, { foreignKey: 'userId' });
UserTasks.belongsTo(User, { foreignKey: 'userId' });

Tasks.hasMany(UserTasks, { foreignKey: 'taskId' });
UserTasks.belongsTo(Tasks, { foreignKey: 'taskId' });

module.exports = {
    User,
    Element,
    Planeta,
    UserResource,
    Spaceports,
    Ship,
    ElementLevelAndSpeed,
    Alliance,
    Tasks,
    UserTasks,
    sequelize
}