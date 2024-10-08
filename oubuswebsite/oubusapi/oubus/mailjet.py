from oubusapi.settings import mailjet


def send_email_alert(student_email):
    data = {
        'Messages': [
            {
                'From': {
                    'Email': 'kiettran19092003@gmail.com',
                    'Name': 'Tran Le Tuan Kiet'
                },
                'To': [
                    {
                        'Email': student_email,
                        'Name': 'Student'
                    }
                ],
                'Subject': 'Thông báo về số vé',
                'TextPart': 'Bạn không còn vé nào trong StudentCombo.',
                'HTMLPart': '<h3>Thông báo</h3><p>Bạn không còn vé nào trong StudentCombo.</p>'
            }
        ]
    }

    result = mailjet.send.create(data=data)
    return result.status_code, result.json()
