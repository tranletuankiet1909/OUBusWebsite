# Generated by Django 5.1 on 2024-10-03 16:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('oubus', '0002_alter_student_birth'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='review',
            options={'ordering': ['-id']},
        ),
        migrations.AlterUniqueTogether(
            name='review',
            unique_together=set(),
        ),
    ]